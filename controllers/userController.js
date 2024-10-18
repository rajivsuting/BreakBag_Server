const User = require("../models/User"); // Assuming the User model is in the models folder

exports.createUser = async (req, res) => {
  const { name, email, phone, role, teamLeadId } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if role is valid
    if (!["Admin", "Agent", "Team Lead"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // If the user is an Agent, assign the teamLead if provided
    const newUser = new User({
      name,
      email,
      phone,
      role,
      teamLead: role === "Agent" && teamLeadId ? teamLeadId : undefined, // Only assign teamLead if the user is an Agent
    });

    // Save the user
    await newUser.save();

    return res.status(201).json({
      message: `${role} created successfully`,
      data: newUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({
      message: "Error creating user",
      error: err.message,
    });
  }
};

// Get all agents
exports.getAllAgentsOrTeamleads = async (req, res) => {
  try {
    const { role } = req.query;
    const agents = await User.find({ role: role });

    if (agents.length === 0) {
      return res.status(404).json({ message: `No ${role} found` });
    }

    return res.status(200).json({
      message: `${role} retrieved successfully`,
      data: agents,
    });
  } catch (err) {
    // console.error(`Error retrieving ${role}:`, err);
    return res.status(500).json({
      message: `Error retrieving ${role}`,
      error: err.message,
    });
  }
};

exports.getAllTeamLeads = async (req, res) => {
  try {
    const agents = await User.find({ role: "Team Lead" });

    if (agents.length === 0) {
      return res.status(404).json({ message: "No Team Leads found" });
    }

    return res.status(200).json({
      message: "Team Leads retrieved successfully",
      data: agents,
    });
  } catch (err) {
    console.error("Error retrieving Team Leads:", err);
    return res.status(500).json({
      message: "Error retrieving Team Leads",
      error: err.message,
    });
  }
};

// Edit agent details
exports.editAgent = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, isTeamlead } = req.body;

  try {
    const agent = await User.findById(id);
    if (!agent || agent.role !== "Agent") {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update agent details
    agent.name = name || agent.name;
    agent.email = email || agent.email;
    agent.phone = phone || agent.phone;
    agent.isTeamlead =
      typeof isTeamlead === "boolean" ? isTeamlead : agent.isTeamlead;

    await agent.save();

    return res.status(200).json({
      message: "Agent updated successfully",
      data: agent,
    });
  } catch (err) {
    console.error("Error updating agent:", err);
    return res.status(500).json({
      message: "Error updating agent",
      error: err.message,
    });
  }
};

// Delete an agent
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const agent = await User.findById(id);

    await agent.remove();

    return res.status(200).json({
      message: "User deleted successfully",
      data: agent,
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({
      message: "Error deleting user",
      error: err.message,
    });
  }
};

// Get Agents under a specific Team Lead
exports.getAgentsUnderTeamLead = async (req, res) => {
  try {
    const { teamLeadId } = req.user; // Get Team Lead ID from request parameters

    // Check if Team Lead ID is provided
    if (!teamLeadId) {
      return res.status(400).json({ message: "Team Lead ID is required." });
    }

    // Find all agents that have the given Team Lead
    const agents = await User.find({
      role: "Agent",
      teamLead: teamLeadId,
    });

    // Check if there are any agents under this Team Lead
    if (!agents || agents.length === 0) {
      return res.status(404).json({
        message: "No agents found under this Team Lead.",
      });
    }

    // Return the list of agents
    return res.status(200).json({
      message: "Agents retrieved successfully",
      data: agents,
    });
  } catch (err) {
    console.error("Error retrieving agents:", err);
    return res.status(500).json({
      message: "Error retrieving agents",
      error: err.message,
    });
  }
};

exports.assignAgentsToTeamLead = async (req, res) => {
  try {
    const { teamLeadId } = req.params; // Get Team Lead ID from request parameters
    const agentIds = req.body; // Get array of Agent IDs from the request body

    // Validate inputs
    if (!teamLeadId) {
      return res.status(400).json({ message: "Team Lead ID is required." });
    }
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return res
        .status(400)
        .json({ message: "A list of Agent IDs is required." });
    }

    // Check if the team lead exists
    const teamLead = await User.findById(teamLeadId);
    if (!teamLead || teamLead.role !== "Team Lead") {
      return res
        .status(404)
        .json({ message: "Team Lead not found or invalid role." });
    }

    // Update the teamLead field for each agent in the list of agentIds
    const result = await User.updateMany(
      { _id: { $in: agentIds }, role: "Agent" }, // Only update Agents
      { $set: { teamLead: teamLeadId } } // Assign them to the Team Lead
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        message: "No agents were assigned. Please verify the agent IDs.",
      });
    }

    return res.status(200).json({
      message: "Agents assigned to Team Lead successfully",
      modifiedCount: result.nModified, // Number of agents modified
    });
  } catch (err) {
    console.error("Error assigning agents:", err);
    return res.status(500).json({
      message: "Error assigning agents",
      error: err.message,
    });
  }
};

const User = require("../models/User"); // Assuming the User model is in the models folder

// Create a new agent
exports.createAgent = async (req, res) => {
  const { name, email, phone, isTeamlead } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const agent = new User({
      name,
      email,
      phone,
      role: "Agent",
      isTeamlead: isTeamlead || false, // Default to false if not provided
    });

    await agent.save();

    return res.status(201).json({
      message: "Agent created successfully",
      data: agent,
    });
  } catch (err) {
    console.error("Error creating agent:", err);
    return res.status(500).json({
      message: "Error creating agent",
      error: err.message,
    });
  }
};

// Get all agents
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "Agent" });

    if (agents.length === 0) {
      return res.status(404).json({ message: "No agents found" });
    }

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
exports.deleteAgent = async (req, res) => {
  const { id } = req.params;

  try {
    const agent = await User.findById(id);
    if (!agent || agent.role !== "Agent") {
      return res.status(404).json({ message: "Agent not found" });
    }

    await agent.remove();

    return res.status(200).json({
      message: "Agent deleted successfully",
      data: agent,
    });
  } catch (err) {
    console.error("Error deleting agent:", err);
    return res.status(500).json({
      message: "Error deleting agent",
      error: err.message,
    });
  }
};

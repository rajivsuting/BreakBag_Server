const User = require("../models/User"); // Assuming the User model is in the models folder
const Quote = require("../models/quote");
const Traveller = require("../models/traveller");

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
    const loggedInUser = req.user;

    if (loggedInUser.role === "Admin") {
      if (role === "Agent") {
        const agents = await User.find({ role: "Agent" })
          .populate("teamLead", "name email")
          .lean();

        if (agents.length === 0) {
          return res.status(404).json({ message: "No agents found" });
        }

        // Retrieve travellers for each Agent
        const agentsWithTravellers = await Promise.all(
          agents.map(async (agent) => {
            const travellers = await Traveller.find(
              { agentAssigned: agent._id },
              "name email phone address userType"
            );
            return {
              ...agent,
              travellers,
            };
          })
        );

        return res.status(200).json({
          message: "Agents retrieved successfully",
          data: agentsWithTravellers,
        });
      } else if (role === "Team Lead") {
        const teamLeads = await User.find({ role: "Team Lead" }).lean();

        if (teamLeads.length === 0) {
          return res.status(404).json({ message: "No team leads found" });
        }

        const teamLeadsWithAgentsAndTravellers = await Promise.all(
          teamLeads.map(async (teamLead) => {
            const agents = await User.find(
              { teamLead: teamLead._id },
              "name email phone"
            ).lean();

            const agentsWithTravellers = await Promise.all(
              agents.map(async (agent) => {
                const travellers = await Traveller.find(
                  { agentAssigned: agent._id },
                  "name email phone address userType"
                );
                return {
                  ...agent,
                  travellers,
                };
              })
            );

            return {
              ...teamLead,
              agents: agentsWithTravellers,
            };
          })
        );

        return res.status(200).json({
          message: "Team Leads retrieved successfully",
          data: teamLeadsWithAgentsAndTravellers,
        });
      } else {
        return res.status(400).json({ message: "Invalid role specified" });
      }
    } else if (loggedInUser.role === "Team Lead") {
      const agents = await User.find({
        role: "Agent",
        teamLead: loggedInUser.userId,
      }).lean();

      if (agents.length === 0) {
        return res
          .status(404)
          .json({ message: "No agents found for this Team Lead" });
      }

      // Retrieve travellers for each Agent
      const agentsWithTravellers = await Promise.all(
        agents.map(async (agent) => {
          const travellers = await Traveller.find(
            { agentAssigned: agent._id },
            "name email phone address userType"
          );
          return {
            ...agent,
            travellers,
          };
        })
      );

      return res.status(200).json({
        message: "Agents retrieved successfully",
        data: agentsWithTravellers,
      });
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (err) {
    return res.status(500).json({
      message: `Error retrieving ${req.query.role || "data"}`,
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
  const { id } = req.params; // ID of the user to be updated
  const { name, email, phone, role } = req.body; // Updated details

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user || (user.role !== "Agent" && user.role !== "Team Lead")) {
      return res.status(404).json({ message: "Agent or Team Lead not found" });
    }

    // If the role is being updated
    if (user.role === "Team Lead" && role !== "Team Lead") {
      // If the user is currently a Team Lead and their role is being updated to anything else
      // Remove `team` reference from all travellers assigned to this Team Lead
      await Traveller.updateMany({ team: id }, { $unset: { team: "" } });

      // Remove `teamLead` reference from all agents managed by this Team Lead
      await User.updateMany({ teamLead: id }, { $unset: { teamLead: "" } });
    }

    // Update the user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      message: "Error updating user",
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

    // Update the `team` field in the Traveller schema for travellers assigned to these agents
    const travellersResult = await Traveller.updateMany(
      { agentAssigned: { $in: agentIds } }, // Find travellers of the assigned agents
      { $set: { team: teamLeadId } } // Assign the new team lead to their team field
    );

    return res.status(200).json({
      message: "Agents assigned to Team Lead successfully",
      agentsModifiedCount: result.nModified, // Number of agents modified
      travellersModifiedCount: travellersResult.nModified, // Number of travellers modified
    });
  } catch (err) {
    console.error("Error assigning agents:", err);
    return res.status(500).json({
      message: "Error assigning agents",
      error: err.message,
    });
  }
};

exports.getUserPerformance = async (req, res) => {
  try {
    const { userId } = req.query; // Get User ID from request parameters

    // Validate inputs
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userQuotes = await Quote.find({ createdBy: userId });

    if (userQuotes.length === 0) {
      return res.status(200).json({
        message: "No quotes found for this user.",

        data: { user, performance: 0, averageRating: 0 },
      });
    }

    res.status(200).json({
      message: "User performance retrieved successfully",
      data: {
        totalQuotes: userQuotes.length,
        quotes: userQuotes,
        user,
      },
    });
  } catch (err) {
    console.error("Error retrieving user performance:", err);
    return res.status(500).json({
      message: "Error retrieving user performance",
      error: err.message,
    });
  }
};

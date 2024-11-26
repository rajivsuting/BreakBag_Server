const Traveller = require("../models/traveller");
const logger = require("../config/logger");
const User = require("../models/User");

// Utility function to handle errors
const handleErrors = (error, res, customMessage = null) => {
  logger.error(customMessage || `Error: ${error.message}`);
  if (error.code === 11000) {
    return res.status(400).json({ message: "Duplicate email detected" });
  }
  return res
    .status(500)
    .json({ message: customMessage || "Server error", error });
};

// Create a Traveller
exports.createTraveller = async (req, res) => {
  const { name, email, phone, address, userType } = req.body;
  let { agentAssigned } = req.body; // Extract agentAssigned if provided in the request

  if (!name || !email || !address) {
    return res
      .status(400)
      .json({ message: "Name, email, and address are required" });
  }

  try {
    // Check the role of the logged-in user
    const loggedInUser = req.user; // Assuming req.user is populated by authentication middleware

    if (loggedInUser.role === "Agent") {
      // If the user is an Agent, set agentAssigned to the logged-in user's ID
      agentAssigned = loggedInUser._id;
    } else if (
      (loggedInUser.role === "Team Lead" || loggedInUser.role === "Admin") &&
      !agentAssigned
    ) {
      // If the user is a Team Lead or Admin, agentAssigned must come from req.body
      return res
        .status(400)
        .json({ message: "Agent assignment is required for this action." });
    }

    // Validate the agentAssigned field
    if (agentAssigned) {
      const agent = await User.findById(agentAssigned);
      if (!agent || agent.role !== "Agent") {
        return res
          .status(400)
          .json({ message: "Invalid or unauthorized agent assigned" });
      }

      // Retrieve the Team Lead associated with the agent
      const team = agent.teamLead;

      // Create the traveller
      const traveller = new Traveller({
        name,
        email,
        phone,
        address,
        userType,
        agentAssigned,
        team,
      });
      await traveller.save();

      return res.status(201).json({
        message: "Traveller created successfully",
        traveller,
      });
    } else {
      return res.status(400).json({ message: "Agent assignment is missing." });
    }
  } catch (error) {
    handleErrors(error, res, "Error creating traveller");
  }
};

// Get all Travellers with Pagination
exports.getTravellers = async (req, res) => {
  const { page = 1, limit } = req.query; // Extract pagination parameters
  const loggedInUser = req.user; // Assuming req.user contains user info like role and id

  try {
    let travellers;
    let total;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    if (loggedInUser.role === "Admin") {
      // Admin: Can view all travellers
      travellers = await Traveller.find()
        .populate("agentAssigned", "name email") // Populate agentAssigned with selected fields
        .skip(skip)
        .limit(limitNum || 0) // If limitNum is not provided, it will return all documents
        .lean(); // Performance optimization: returns plain JS objects

      total = await Traveller.countDocuments();
    } else if (loggedInUser.role === "Agent") {
      // Non-Admin: Can only view travellers assigned to them
      travellers = await Traveller.find({
        agentAssigned: loggedInUser.userId,
      })
        .populate("agentAssigned", "name email")
        .skip(skip)
        .limit(limitNum || 0)
        .lean();

      total = await Traveller.countDocuments({
        agentAssigned: loggedInUser.userId,
      });
    } else {
      travellers = await Traveller.find({ team: loggedInUser.userId })
        .populate("agentAssigned", "name email")
        .skip(skip)
        .limit(limitNum || 0)
        .lean();

      total = await Traveller.countDocuments({
        team: loggedInUser.userId,
      });
    }

    if (travellers.length === 0) {
      return res.status(404).json({ message: "No travellers found." });
    }

    res.status(200).json({
      status: "success",
      travellers,
      currentPage: pageNum,
      totalPages: Math.ceil(total / (limitNum || 1)), // Calculate total pages based on the limit
      totalTravellers: total,
    });
  } catch (error) {
    console.error(`Error fetching travellers: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Error fetching travellers",
      error: error.message,
    });
  }
};

// Get a single Traveller by ID
exports.getTravellerById = async (req, res) => {
  const { id } = req.params;

  try {
    const traveller = await Traveller.findById(id).lean(); // Performance optimization
    if (!traveller) {
      return res.status(404).json({ message: "Traveller not found" });
    }
    res.status(200).json(traveller);
  } catch (error) {
    handleErrors(error, res, "Error fetching traveller");
  }
};

// Update a Traveller by ID
exports.updateTraveller = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, agentAssigned } = req.body;

  try {
    // Create an update object with only the fields provided in the request
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (agentAssigned) updateData.agentAssigned = agentAssigned;

    // Update the traveller document with the dynamically created update object
    const traveller = await Traveller.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean(); // Performance optimization

    if (!traveller) {
      return res.status(404).json({ message: "Traveller not found" });
    }

    res
      .status(200)
      .json({ message: "Traveller updated successfully", traveller });
  } catch (error) {
    handleErrors(error, res, "Error updating traveller");
  }
};

// Delete a Traveller by ID
exports.deleteTraveller = async (req, res) => {
  const { id } = req.params;

  try {
    const traveller = await Traveller.findByIdAndDelete(id);
    if (!traveller) {
      return res.status(404).json({ message: "Traveller not found" });
    }
    res.status(200).json({ message: "Traveller deleted successfully" });
  } catch (error) {
    handleErrors(error, res, "Error deleting traveller");
  }
};

exports.assignTravellerToAgent = async (req, res) => {
  try {
    const { travellerId, agentId } = req.body; // Get traveller and agent IDs from request body

    // Validate inputs
    if (!travellerId || !agentId) {
      return res
        .status(400)
        .json({ message: "Traveller ID and Agent ID are required." });
    }

    // Check if the agent exists and has the "Agent" role
    const agent = await User.findOne({ _id: agentId, role: "Agent" });
    if (!agent) {
      return res
        .status(404)
        .json({ message: "Agent not found or is not assigned as an Agent." });
    }

    // Find and update the traveller with the assigned agent
    const traveller = await Traveller.findByIdAndUpdate(
      travellerId,
      { agentAssigned: agentId },
      { new: true } // Return the updated traveller
    );

    if (!traveller) {
      return res.status(404).json({ message: "Traveller not found." });
    }

    return res.status(200).json({
      message: "Traveller assigned to agent successfully",
      data: traveller,
    });
  } catch (err) {
    console.error("Error assigning traveller to agent:", err);
    return res.status(500).json({
      message: "Error assigning traveller to agent",
      error: err.message,
    });
  }
};

exports.searchTravellerByName = async (req, res) => {
  try {
    const { name } = req.query;

    // Validate that a name is provided
    if (!name) {
      return res.status(400).json({ message: "Name is required for search." });
    }

    // Perform a case-insensitive search with partial matching
    const regex = new RegExp(name, "i"); // 'i' flag makes it case-insensitive
    const travellers = await Traveller.find({ name: { $regex: regex } });

    // Check if any travellers were found
    if (travellers.length === 0) {
      return res
        .status(404)
        .json({ message: "No travellers found with the given name." });
    }

    // Return the found travellers
    return res.status(200).json({
      message: "Travellers found successfully.",
      data: travellers,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error searching for traveller", error: err.message });
  }
};
exports.deleteTraveller = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters

    // Find and delete the traveller by ID
    const deletedTraveller = await Traveller.findByIdAndDelete(id);

    // If no traveller is found, return a 404 error
    if (!deletedTraveller) {
      return res.status(404).json({
        message: "Traveller not found.",
      });
    }

    // Send a success response
    return res.status(200).json({
      message: "Traveller deleted successfully",
      data: deletedTraveller,
    });
  } catch (err) {
    console.error("Error deleting traveller:", err);
    return res.status(500).json({
      message: "Error deleting traveller",
      error: err.message,
    });
  }
};

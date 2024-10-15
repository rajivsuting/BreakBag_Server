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
  const { name, email, phone, address, dateOfBirth, userType, agentAssigned } =
    req.body;

  if (!name || !email || !address) {
    return res
      .status(400)
      .json({ message: "Name, email, and address are required" });
  }

  try {
    const traveller = new Traveller({
      name,
      email,
      phone,
      address,
      dateOfBirth,
      userType,
      agentAssigned,
    });
    await traveller.save();
    res
      .status(201)
      .json({ message: "Traveller created successfully", traveller });
  } catch (error) {
    handleErrors(error, res, "Error creating traveller");
  }
};

// Get all Travellers with Pagination
exports.getTravellers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default pagination values

  try {
    const travellers = await Traveller.find()
      .lean() // Performance optimization: returns plain JS objects
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Traveller.countDocuments();

    res.status(200).json({
      travellers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTravellers: total,
    });
  } catch (error) {
    logger.error(`Error fetching travellers: ${error.message}`);
    res.status(500).json({ message: "Error fetching travellers", error });
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
  const { name, email, phone, address } = req.body;

  try {
    const traveller = await Traveller.findByIdAndUpdate(
      id,
      { name, email, phone, address },
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

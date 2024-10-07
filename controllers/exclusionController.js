const Exclusion = require("../models/exclusion");

exports.createExclusion = async (req, res) => {
  try {
    const { itemList, destination } = req.body; // Extract itemList from the request body

    if (!itemList || itemList.length === 0) {
      return res.status(400).json({ message: "No items provided." });
    }

    // Create a new exclusion record in the database
    const newExclusion = await Exclusion.create({
      itemList,
      destination,
    });

    // Send a success response
    return res.status(201).json({
      message: "Exclusion created successfully",
      data: newExclusion,
    });
  } catch (err) {
    console.error("Error creating exclusion:", err);
    return res
      .status(500)
      .json({ message: "Error creating exclusion", error: err.message });
  }
};

exports.getAllExclusions = async (req, res) => {
  try {
    const exclusions = await Exclusion.find().populate("destination", "title"); // Fetch all exclusions from the database

    if (exclusions.length === 0) {
      return res.status(404).json({ message: "No exclusions found." });
    }

    // Send the retrieved exclusions
    return res.status(200).json({
      message: "Exclusions retrieved successfully",
      data: exclusions,
    });
  } catch (err) {
    console.error("Error fetching exclusions:", err);
    return res
      .status(500)
      .json({ message: "Error fetching exclusions", error: err.message });
  }
};

exports.getExclusionByDestination = async (req, res) => {
  try {
    const { destination } = req.params; // Get destination from request parameters

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const exclusions = await Exclusion.findOne({ destination });

    if (exclusions.length === 0) {
      return res
        .status(404)
        .json({ message: "No exclusions found for this destination." });
    }

    return res.status(200).json({
      message: "Exclusions retrieved successfully",
      data: exclusions,
    });
  } catch (err) {
    console.error("Error retrieving exclusions:", err);
    return res.status(500).json({
      message: "Error retrieving exclusions",
      error: err.message,
    });
  }
};

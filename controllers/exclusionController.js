const Exclusion = require("../models/exclusion");

exports.createExclusion = async (req, res) => {
  try {
    const { description, title } = req.body; // Extract description from the request body

    if (!description) {
      return res.status(400).json({ message: "No items provided." });
    }

    // Create a new exclusion record in the database
    const newExclusion = await Exclusion.create({
      description,
      title,
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
    const exclusions = await Exclusion.find();

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

exports.searchExclusionsByKeyword = async (req, res) => {
  try {
    const { keywords } = req.query; // Get search keywords from query parameters

    // Validate keywords
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json({ message: "Search keywords are required." });
    }

    // Perform text search on 'title' and 'description' using the provided keywords
    const exclusions = await Exclusion.find({
      $text: { $search: keywords },
    });

    if (!exclusions || exclusions.length === 0) {
      return res
        .status(404)
        .json({ message: "No exclusions found matching the keywords." });
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

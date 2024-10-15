const Inclusion = require("../models/inclusion");

exports.createInclusion = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const newInclusion = await Inclusion.create({
      title,
      description,
    });

    return res.status(201).json({
      message: "Inclusion created successfully",
      data: newInclusion,
    });
  } catch (err) {
    console.error("Error creating inclusion:", err);
    return res.status(500).json({
      message: "Error creating inclusion",
      error: err.message,
    });
  }
};

exports.getAllInclusions = async (req, res) => {
  try {
    const inclusions = await Inclusion.find();

    if (!inclusions || inclusions.length === 0) {
      return res.status(404).json({
        message: "No inclusions found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Inclusions retrieved successfully",
      data: inclusions,
    });
  } catch (err) {
    console.error("Error retrieving inclusions:", err);
    return res.status(500).json({
      message: "Error retrieving inclusions",
      error: err.message,
    });
  }
};

exports.searchInclusionsByKeyword = async (req, res) => {
  try {
    const { keywords } = req.query; // Get search keywords from query parameters

    // Validate keywords
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json({ message: "Search keywords are required." });
    }

    // Create a case-insensitive regex for substring matching
    const regex = new RegExp(keywords, "i");

    // Perform search on 'title' and 'description' using regex for substring matching
    const inclusions = await Inclusion.find({
      $or: [
        { title: { $regex: regex } }, // Search within the title field
        { description: { $regex: regex } }, // Search within the description field
      ],
    });

    if (!inclusions || inclusions.length === 0) {
      return res
        .status(404)
        .json({ message: "No inclusions found matching the keywords." });
    }

    return res.status(200).json({
      message: "Inclusions retrieved successfully",
      data: inclusions,
    });
  } catch (err) {
    console.error("Error retrieving inclusions:", err);
    return res.status(500).json({
      message: "Error retrieving inclusions",
      error: err.message,
    });
  }
};

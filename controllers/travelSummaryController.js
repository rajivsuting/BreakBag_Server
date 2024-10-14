const TravelSummary = require("../models/travelSummary");
const logger = require("../config/logger");

// Create a new Travel Summary
exports.createTravelSummary = async (req, res) => {
  const { title, description } = req.body;

  // Validate required fields
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  try {
    const travelSummary = new TravelSummary({
      title,
      description,
    });

    await travelSummary.save();
    res
      .status(201)
      .json({ message: "Travel Summary created successfully", travelSummary });
  } catch (error) {
    logger.error(`Error creating travel summary: ${error.message}`);
    res.status(500).json({ message: "Error creating travel summary", error });
  }
};

// Get all Travel Summaries with Pagination
exports.getAllTravelSummary = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const travelSummaries = await TravelSummary.find()
      .populate("destination", "title")
      .lean() // Performance optimization
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TravelSummary.countDocuments();

    res.status(200).json({
      travelSummaries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSummaries: total,
    });
  } catch (error) {
    logger.error(`Error fetching travel summaries: ${error.message}`);
    res.status(500).json({ message: "Error fetching travel summaries", error });
  }
};

exports.searchTravelSummariesByKeyword = async (req, res) => {
  try {
    const { keyword } = req.query; // Get keyword from query parameters

    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Keyword is required for search." });
    }

    // Search for travel summaries with a keyword in title or description
    const results = await TravelSummary.find({
      $text: { $search: keyword },
    });

    if (!results || results.length === 0) {
      return res.status(404).json({
        message: "No travel summaries found matching the keyword.",
      });
    }

    return res.status(200).json({
      message: "Travel summaries retrieved successfully",
      data: results,
    });
  } catch (err) {
    console.error("Error retrieving travel summaries:", err);
    return res.status(500).json({
      message: "Error retrieving travel summaries",
      error: err.message,
    });
  }
};

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
  const { page = 1, limit } = req.query; // Extract pagination parameters

  try {
    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    // Fetch travel summaries from the database with optional pagination
    const travelSummaries = await TravelSummary.find()
      .skip(skip)
      .limit(limitNum || 0) // If limitNum is not provided, it will return all documents
      .lean(); // Performance optimization: returns plain JS objects

    // Get the total number of travel summaries
    const total = await TravelSummary.countDocuments();

    // Check if any travel summaries were found
    if (travelSummaries.length === 0) {
      return res.status(404).json({ message: "No travel summaries found." });
    }

    res.status(200).json({
      status: "success",
      travelSummaries,
      currentPage: pageNum,
      totalPages: Math.ceil(total / (limitNum || 1)), // Calculate total pages based on the limit
      totalSummaries: total,
    });
  } catch (error) {
    console.error(`Error fetching travel summaries: ${error.message}`);
    res.status(500).json({
      message: "Error fetching travel summaries",
      error: error.message,
    });
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

    // Create a case-insensitive regex for substring matching
    const regex = new RegExp(keyword, "i");

    // Search for travel summaries where title or description matches the regex
    const results = await TravelSummary.find({
      $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }],
    });

    // Check if results were found
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
exports.editTravelSummary = async (req, res) => {
  const { id } = req.params; // Get the ID of the travel summary to update from the route parameters
  const { title, description } = req.body; // Get the updated data from the request body

  // Validate required fields
  if (!title && !description) {
    return res.status(400).json({
      message:
        "At least one field (title or description) is required to update",
    });
  }

  try {
    // Find the TravelSummary record by ID
    const travelSummary = await TravelSummary.findById(id);
    if (!travelSummary) {
      return res.status(404).json({ message: "Travel summary not found" });
    }

    // Update the fields if provided in the request body
    if (title) travelSummary.title = title;
    if (description) travelSummary.description = description;

    // Save the updated record
    await travelSummary.save();

    // Send a success response
    res.status(200).json({
      message: "Travel summary updated successfully",
      travelSummary,
    });
  } catch (error) {
    logger.error(`Error updating travel summary: ${error.message}`);
    res.status(500).json({ message: "Error updating travel summary", error });
  }
};
exports.deleteTravelSummary = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters

    // Find and delete the travel summary by ID
    const deletedTravelSummary = await TravelSummary.findByIdAndDelete(id);

    // If no travel summary is found, return a 404 error
    if (!deletedTravelSummary) {
      return res.status(404).json({
        message: "Travel Summary not found.",
      });
    }

    // Send a success response
    return res.status(200).json({
      message: "Travel Summary deleted successfully",
      data: deletedTravelSummary,
    });
  } catch (err) {
    logger.error(`Error deleting travel summary: ${err.message}`);
    return res.status(500).json({
      message: "Error deleting travel summary",
      error: err.message,
    });
  }
};

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

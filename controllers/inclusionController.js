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
    // Extract page and limit from query parameters
    const { page = 1, limit } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    // Fetch inclusions from the database with optional pagination
    const inclusions = await Inclusion.find()
      .skip(skip)
      .limit(limitNum || 0); // If limitNum is not provided, it will return all documents

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

exports.editInclusion = async (req, res) => {
  try {
    const { id } = req.params; // Get the inclusion ID from the route parameters
    const { title, description } = req.body; // Get the updated fields from the request body

    // Find the inclusion by ID
    const inclusion = await Inclusion.findById(id);
    if (!inclusion) {
      return res.status(404).json({ message: "Inclusion not found." });
    }

    // Update the inclusion fields if provided
    if (title) inclusion.title = title;
    if (description) inclusion.description = description;

    // Save the updated inclusion record
    const updatedInclusion = await inclusion.save();

    // Send a success response
    return res.status(200).json({
      message: "Inclusion updated successfully",
      data: updatedInclusion,
    });
  } catch (err) {
    console.error("Error updating inclusion:", err);
    return res.status(500).json({
      message: "Error updating inclusion",
      error: err.message,
    });
  }
};
exports.deleteInclusion = async (req, res) => {
  try {
    const { id } = req.params; // Get the inclusion ID from the request parameters

    // Find and delete the inclusion by ID
    const deletedInclusion = await Inclusion.findByIdAndDelete(id);

    // If the inclusion does not exist, return a 404 error
    if (!deletedInclusion) {
      return res.status(404).json({
        message: "Inclusion not found.",
      });
    }

    // Return a success response
    return res.status(200).json({
      message: "Inclusion deleted successfully",
      data: deletedInclusion,
    });
  } catch (err) {
    console.error("Error deleting inclusion:", err);
    return res.status(500).json({
      message: "Error deleting inclusion",
      error: err.message,
    });
  }
};

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
    // Extract page and limit from query parameters
    const { page = 1, limit } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    // Fetch exclusions from the database with optional pagination
    const exclusions = await Exclusion.find()
      .skip(skip)
      .limit(limitNum || 0); // If limitNum is not provided, it will return all documents

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
    return res.status(500).json({
      message: "Error fetching exclusions",
      error: err.message,
    });
  }
};

exports.searchExclusionsByKeyword = async (req, res) => {
  try {
    const { keywords } = req.query; // Get search keywords from query parameters

    // Validate keywords
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json({ message: "Search keywords are required." });
    }

    // Create a case-insensitive regex for substring matching
    const regex = new RegExp(keywords, "i");

    // Perform search on 'title' and 'description' using regex for substring matching
    const exclusions = await Exclusion.find({
      $or: [
        { title: { $regex: regex } }, // Search in title
        { description: { $regex: regex } }, // Search in description
      ],
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
exports.editExclusion = async (req, res) => {
  try {
    const { id } = req.params; // Get the exclusion ID from the route parameters
    const { description, title } = req.body; // Get the updated fields from the request body

    // Find the exclusion by ID
    const exclusion = await Exclusion.findById(id);
    if (!exclusion) {
      return res.status(404).json({ message: "Exclusion not found." });
    }

    // Update the exclusion fields if provided
    if (description) exclusion.description = description;
    if (title) exclusion.title = title;

    // Save the updated exclusion record
    const updatedExclusion = await exclusion.save();

    // Send a success response
    return res.status(200).json({
      message: "Exclusion updated successfully",
      data: updatedExclusion,
    });
  } catch (err) {
    console.error("Error updating exclusion:", err);
    return res
      .status(500)
      .json({ message: "Error updating exclusion", error: err.message });
  }
};
exports.deleteExclusion = async (req, res) => {
  try {
    const { id } = req.params; // Get the exclusion ID from the request parameters

    // Find and delete the exclusion by ID
    const deletedExclusion = await Exclusion.findByIdAndDelete(id);

    // If the exclusion does not exist, return a 404 error
    if (!deletedExclusion) {
      return res.status(404).json({ message: "Exclusion not found." });
    }

    // Return a success response
    return res.status(200).json({
      message: "Exclusion deleted successfully",
      data: deletedExclusion,
    });
  } catch (err) {
    console.error("Error deleting exclusion:", err);
    return res.status(500).json({
      message: "Error deleting exclusion",
      error: err.message,
    });
  }
};

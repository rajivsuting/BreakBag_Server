const Activity = require("../models/activity");

// Create a new activity
exports.createActivity = async (req, res) => {
  try {
    const { title, description, destination } = req.body; // Extract title and description from the request body
    const files = req.files; // Get the uploaded files from the request

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded." });
    }

    // Extract image URLs from the uploaded files
    const imageUrls = files.map((file) => file.location); // `location` contains the URL to each uploaded file

    // Create a new activity record in the database
    const newActivity = await Activity.create({
      title,
      description,
      images: imageUrls,
      destination, // Store the array of image URLs in the database
    });

    // Send a success response
    return res.status(201).json({
      message: "Activity created successfully",
      data: newActivity,
    });
  } catch (err) {
    console.error("Error creating activity:", err);
    return res
      .status(500)
      .json({ message: "Error creating activity", error: err.message });
  }
};

// Get all activities
exports.getAllActivity = async (req, res) => {
  try {
    // Extract page and limit from query parameters
    const { page = 1, limit } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    // Fetch activities from the database with optional pagination
    const activities = await Activity.find()
      .populate("destination", "title")
      .skip(skip)
      .limit(limitNum || 0); // If limitNum is not provided, it will return all documents

    if (activities.length === 0) {
      return res.status(404).json({ message: "No activities found" });
    }

    // Send a success response with the list of activities
    return res.status(200).json({
      message: "Activities retrieved successfully",
      data: activities,
    });
  } catch (err) {
    console.error("Error retrieving activities:", err);
    return res.status(500).json({
      message: "Error retrieving activities",
      error: err.message,
    });
  }
};

exports.searchActivityByKeyword = async (req, res) => {
  try {
    const { keyword } = req.query; // Get keyword from query parameters

    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Keyword is required for search." });
    }

    // Create a case-insensitive regex for substring matching
    const regex = new RegExp(keyword, "i");

    // Search for activity where title or description matches the regex
    const results = await Activity.find({
      $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }],
    }).populate("destination", "title");

    // Check if results were found
    if (!results || results.length === 0) {
      return res.status(404).json({
        message: "No activity found matching the keyword.",
      });
    }

    return res.status(200).json({
      message: "activity retrieved successfully",
      data: results,
    });
  } catch (err) {
    console.error("Error retrieving activity:", err);
    return res.status(500).json({
      message: "Error retrieving activity",
      error: err.message,
    });
  }
};
exports.editActivity = async (req, res) => {
  try {
    const { id } = req.params; // Get the activity ID from the route parameters
    const { title, description, destination } = req.body; // Get the new data from the request body
    const files = req.files; // Get the uploaded files from the request

    // Check if the activity exists
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    // Update the activity details
    if (title) activity.title = title;
    if (description) activity.description = description;
    if (destination) activity.destination = destination;

    // If new images are uploaded, update the images array
    if (files && files.length > 0) {
      const imageUrls = files.map((file) => file.location); // Get new image URLs
      activity.images.push(...imageUrls); // Update the images in the database
    }

    // Save the updated activity
    const updatedActivity = await activity.save();

    // Send a success response
    return res.status(200).json({
      message: "Activity updated successfully",
      data: updatedActivity,
    });
  } catch (err) {
    console.error("Error updating activity:", err);
    return res
      .status(500)
      .json({ message: "Error updating activity", error: err.message });
  }
};
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params; // Activity ID from URL parameters

    // Find the activity by ID
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    // Delete the activity
    await Activity.findByIdAndDelete(id);

    return res.status(200).json({ message: "Activity deleted successfully." });
  } catch (err) {
    console.error("Error deleting activity:", err);
    return res
      .status(500)
      .json({ message: "Error deleting activity", error: err.message });
  }
};

exports.removeImagesFromActivity = async (req, res) => {
  try {
    const { id } = req.params; // Activity ID from URL parameters
    const { imageUrls } = req.body; // Array of image URLs to be removed

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    activity.images = activity.images.filter((url) => !imageUrls.includes(url));

    // Save the updated activity
    const updatedActivity = await activity.save();

    // Send a success response
    return res.status(200).json({
      message: "Images removed from activity successfully",
      data: updatedActivity,
    });
  } catch (error) {
    console.error("Error removing images from activity:", error);
    return res.status(500).json({
      message: "Error removing images from activity",
      error: error.message,
    });
  }
};

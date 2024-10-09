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
    // Fetch all activities from the database
    const activities = await Activity.find().populate("destination", "title");

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
    return res
      .status(500)
      .json({ message: "Error retrieving activities", error: err.message });
  }
};

exports.searchActivityByDestination = async (req, res) => {
  const { destination } = req.params;

  // Validate required field
  if (!destination) {
    return res.status(400).json({ message: "Destination is required" });
  }

  try {
    // Use a case-insensitive regular expression to search for a substring match
    const activities = await Activity.find({
      destination: { $regex: destination, $options: "i" }, // 'i' for case-insensitive, regex allows partial match
    });

    if (activities.length === 0) {
      return res
        .status(404)
        .json({
          message: "No activities found matching the destination pattern",
        });
    }

    res.status(200).json({
      message:
        "Activities matching the destination pattern retrieved successfully",
      data: activities,
    });
  } catch (error) {
    console.error(`Error searching activities: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error searching activities", error: error.message });
  }
};

const Destination = require("../models/destination");

// Controller function to create a new destination
exports.createDestination = async (req, res) => {
  try {
    const { title } = req.body; // Extract title from request body
    const file = req.file; // Get the uploaded file from the request

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Construct the image URL using the uploaded file's key
    const imageUrl = file.location; // `location` contains the URL to the uploaded file

    // Create a new destination record in the database
    const newDestination = await Destination.create({
      title,
      image: imageUrl, // Store the image URL in the database
    });

    // Send a success response
    return res.status(201).json({
      message: "Destination created successfully",
      data: newDestination,
    });
  } catch (err) {
    console.error("Error creating destination:", err);
    return res
      .status(500)
      .json({ message: "Error creating destination", error: err.message });
  }
};

exports.getAllDestinations = async (req, res) => {
  try {
    // Extract page and limit from query parameters
    const { page = 1, limit } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    // Fetch destinations from the database with optional pagination
    const destinations = await Destination.find()
      .skip(skip)
      .limit(limitNum || 0); // If limitNum is not provided, it will return all documents

    if (!destinations || destinations.length === 0) {
      return res.status(404).json({
        message: "No destinations found",
      });
    }

    return res.status(200).json({
      message: "Destinations retrieved successfully",
      data: destinations,
    });
  } catch (err) {
    console.error("Error retrieving destinations:", err);
    return res.status(500).json({
      message: "Error retrieving destinations",
      error: err.message,
    });
  }
};

exports.searchDestinationByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ message: "Title is required for search." });
    }

    const regex = new RegExp(title, "i");
    const destinations = await Destination.find({ title: { $regex: regex } });

    if (destinations.length === 0) {
      return res
        .status(404)
        .json({ message: "No destinations found with the given title." });
    }

    return res.status(200).json({
      message: "Destinations found successfully.",
      data: destinations,
    });
  } catch (err) {
    console.error("Error searching for destination:", err);
    return res
      .status(500)
      .json({ message: "Error searching for destination", error: err.message });
  }
};

exports.editDestination = async (req, res) => {
  try {
    const { id } = req.params; // Get the destination ID from the route parameters
    const { title } = req.body; // Get the updated title from the request body
    const file = req.file; // Get the uploaded file from the request (if any)

    // Find the destination by ID
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found." });
    }

    // Update the destination title if provided
    if (title) destination.title = title;

    // If a new image is uploaded, update the image URL
    if (file) {
      const imageUrl = file.location; // Get the new image URL from the uploaded file
      destination.image = imageUrl; // Update the image URL in the database
    }

    // Save the updated destination record
    const updatedDestination = await destination.save();

    // Send a success response
    return res.status(200).json({
      message: "Destination updated successfully",
      data: updatedDestination,
    });
  } catch (err) {
    console.error("Error updating destination:", err);
    return res
      .status(500)
      .json({ message: "Error updating destination", error: err.message });
  }
};
exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params; // Extract the destination ID from the URL parameters

    // Find the destination by ID
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found." });
    }

    // Delete the destination
    await Destination.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Destination deleted successfully." });
  } catch (err) {
    console.error("Error deleting destination:", err);
    return res
      .status(500)
      .json({ message: "Error deleting destination", error: err.message });
  }
};

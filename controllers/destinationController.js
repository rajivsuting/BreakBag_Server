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

const OtherInformation = require("../models/otherInformation");

exports.createOtherInformation = async (req, res) => {
  try {
    const { description, destination } = req.body; // Extract description from the request body

    if (!description || description.length === 0) {
      return res.status(400).json({ message: "No items provided." });
    }

    // Create a new OtherInformation record in the database
    const newOtherInformation = await OtherInformation.create({
      description,
      destination,
    });

    // Send a success response
    return res.status(201).json({
      message: "Other information created successfully",
      data: newOtherInformation,
    });
  } catch (err) {
    console.error("Error creating other information:", err);
    return res.status(500).json({
      message: "Error creating other information",
      error: err.message,
    });
  }
};

exports.getAllOtherInformation = async (req, res) => {
  try {
    const otherInformationList = await OtherInformation.find().populate(
      "destination",
      "title"
    ); // Fetch all records from the database

    if (otherInformationList.length === 0) {
      return res.status(404).json({ message: "No other information found." });
    }

    // Send the retrieved records
    return res.status(200).json({
      message: "Other information retrieved successfully",
      data: otherInformationList,
    });
  } catch (err) {
    console.error("Error fetching other information:", err);
    return res.status(500).json({
      message: "Error fetching other information",
      error: err.message,
    });
  }
};

exports.getOtherinformationByDestination = async (req, res) => {
  try {
    const { destination } = req.params; // Get destination from request parameters

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const otherInformation = await OtherInformation.findOne({ destination });

    if (otherInformation.length === 0) {
      return res
        .status(404)
        .json({ message: "No otherInformation found for this destination." });
    }

    return res.status(200).json({
      message: "Otherinformation retrieved successfully",
      data: otherInformation,
    });
  } catch (err) {
    console.error("Error retrieving Otherinformation:", err);
    return res.status(500).json({
      message: "Error retrieving Otherinformation",
      error: err.message,
    });
  }
};

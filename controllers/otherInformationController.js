const OtherInformation = require("../models/otherInformation");

exports.createOtherInformation = async (req, res) => {
  try {
    const { description, title } = req.body; // Extract description from the request body

    if (!description) {
      return res.status(400).json({ message: "No items provided." });
    }

    // Create a new OtherInformation record in the database
    const newOtherInformation = await OtherInformation.create({
      description,
      title,
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
    const otherInformationList = await OtherInformation.find(); // Fetch all records from the database

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

exports.searchOtherInformationByKeyword = async (req, res) => {
  try {
    const { keywords } = req.query; // Get search keywords from query parameters

    // Validate keywords
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json({ message: "Search keywords are required." });
    }

    // Perform a text search on the 'description' field using the provided keywords
    const otherInformation = await OtherInformation.find({
      $text: { $search: keywords },
    });

    if (!otherInformation || otherInformation.length === 0) {
      return res
        .status(404)
        .json({ message: "No information found matching the keywords." });
    }

    return res.status(200).json({
      message: "Information retrieved successfully",
      data: otherInformation,
    });
  } catch (err) {
    console.error("Error retrieving information:", err);
    return res.status(500).json({
      message: "Error retrieving information",
      error: err.message,
    });
  }
};

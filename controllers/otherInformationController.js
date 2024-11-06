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
    // Extract page and limit from query parameters
    const { page = 1, limit } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    // Fetch other information records from the database with optional pagination
    const otherInformationList = await OtherInformation.find()
      .skip(skip)
      .limit(limitNum || 0); // If limitNum is not provided, it will return all documents

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

    // Create a case-insensitive regex for substring matching
    const regex = new RegExp(keywords, "i");

    // Perform search on 'description' using regex for substring matching
    const otherInformation = await OtherInformation.find({
      description: { $regex: regex },
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
exports.editOtherInformation = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID of the record to update from the route parameters
    const { description, title } = req.body; // Get the updated data from the request body

    // Find the OtherInformation record by ID
    const otherInformation = await OtherInformation.findById(id);
    if (!otherInformation) {
      return res.status(404).json({ message: "Other information not found." });
    }

    // Update the fields with new values if provided
    if (description) otherInformation.description = description;
    if (title) otherInformation.title = title;

    // Save the updated record to the database
    const updatedOtherInformation = await otherInformation.save();

    // Send a success response
    return res.status(200).json({
      message: "Other information updated successfully",
      data: updatedOtherInformation,
    });
  } catch (err) {
    console.error("Error updating other information:", err);
    return res.status(500).json({
      message: "Error updating other information",
      error: err.message,
    });
  }
};

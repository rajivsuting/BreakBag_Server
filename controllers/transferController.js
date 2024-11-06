const Transfer = require("../models/transfer");

exports.createTransfer = async (req, res) => {
  try {
    const { description, title } = req.body; // Extract description from the request body

    if (!description) {
      return res.status(400).json({ message: "No items provided." });
    }

    // Create a new transfer record in the database
    const newTransfer = await Transfer.create({
      description,
      title,
    });

    // Send a success response
    return res.status(201).json({
      message: "Transfer created successfully",
      data: newTransfer,
    });
  } catch (err) {
    console.error("Error creating transfer:", err);
    return res
      .status(500)
      .json({ message: "Error creating transfer", error: err.message });
  }
};

exports.getAllTransfers = async (req, res) => {
  try {
    // Extract page and limit from query parameters
    const { page = 1, limit } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined; // If limit is not provided, it will be undefined

    // Calculate the skip value
    const skip = (pageNum - 1) * (limitNum || 1); // Use limitNum or default to 1

    // Fetch transfers from the database with optional pagination
    const transfers = await Transfer.find()
      .skip(skip)
      .limit(limitNum || 0); // If limitNum is not provided, it will return all documents

    if (transfers.length === 0) {
      return res.status(404).json({ message: "No transfers found." });
    }

    // Send the retrieved transfers
    return res.status(200).json({
      message: "Transfers retrieved successfully",
      data: transfers,
    });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    return res.status(500).json({
      message: "Error fetching transfers",
      error: err.message,
    });
  }
};

exports.searchTransfersByKeyword = async (req, res) => {
  try {
    const { keywords } = req.query; // Get search keywords from query parameters

    // Validate keywords
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json({ message: "Search keywords are required." });
    }

    // Create a case-insensitive regex for substring matching
    const regex = new RegExp(keywords, "i");

    // Perform search on 'description' using regex for substring matching
    const transfers = await Transfer.find({
      description: { $regex: regex },
    });

    if (!transfers || transfers.length === 0) {
      return res
        .status(404)
        .json({ message: "No transfers found matching the keywords." });
    }

    return res.status(200).json({
      message: "Transfers retrieved successfully",
      data: transfers,
    });
  } catch (err) {
    console.error("Error retrieving transfers:", err);
    return res.status(500).json({
      message: "Error retrieving transfers",
      error: err.message,
    });
  }
};
exports.editTransfer = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID of the transfer to update from the route parameters
    const { description, title } = req.body; // Get the updated data from the request body

    // Find the Transfer record by ID
    const transfer = await Transfer.findById(id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found." });
    }

    // Update the fields if provided in the request body
    if (description) transfer.description = description;
    if (title) transfer.title = title;

    // Save the updated Transfer record
    const updatedTransfer = await transfer.save();

    // Send a success response
    return res.status(200).json({
      message: "Transfer updated successfully",
      data: updatedTransfer,
    });
  } catch (err) {
    console.error("Error updating transfer:", err);
    return res.status(500).json({
      message: "Error updating transfer",
      error: err.message,
    });
  }
};

exports.deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters

    // Find and delete the transfer by ID
    const deletedTransfer = await Transfer.findByIdAndDelete(id);

    // If no record is found, return a 404 error
    if (!deletedTransfer) {
      return res.status(404).json({
        message: "Transfer not found.",
      });
    }

    // Send a success response
    return res.status(200).json({
      message: "Transfer deleted successfully",
      data: deletedTransfer,
    });
  } catch (err) {
    console.error("Error deleting transfer:", err);
    return res.status(500).json({
      message: "Error deleting transfer",
      error: err.message,
    });
  }
};

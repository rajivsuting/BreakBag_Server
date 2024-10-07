const Transfer = require("../models/transfer");

exports.createTransfer = async (req, res) => {
  try {
    const { itemList, destination } = req.body; // Extract itemList from the request body

    if (!itemList || itemList.length === 0) {
      return res.status(400).json({ message: "No items provided." });
    }

    // Create a new transfer record in the database
    const newTransfer = await Transfer.create({
      itemList, destination
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
    const transfers = await Transfer.find().populate("destination", "title");; // Fetch all transfers from the database

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
    return res
      .status(500)
      .json({ message: "Error fetching transfers", error: err.message });
  }
};


exports.getTransferByDestination = async (req, res) => {
  try {
    const { destination } = req.params; // Get destination from request parameters

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const transfer = await Transfer.findOne({ destination });

    if (transfer.length === 0) {
      return res
        .status(404)
        .json({ message: "No transfer found for this destination." });
    }

    return res.status(200).json({
      message: "Transfer retrieved successfully",
      data: transfer,
    });
  } catch (err) {
    console.error("Error retrieving Transfer:", err);
    return res.status(500).json({
      message: "Error retrieving Transfer",
      error: err.message,
    });
  }
};
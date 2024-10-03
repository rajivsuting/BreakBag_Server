const Transfer = require("../models/transfer");

exports.createTransfer = async (req, res) => {
  try {
    const { itemList } = req.body; // Extract itemList from the request body

    if (!itemList || itemList.length === 0) {
      return res.status(400).json({ message: "No items provided." });
    }

    // Create a new transfer record in the database
    const newTransfer = await Transfer.create({
      itemList,
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
    const transfers = await Transfer.find(); // Fetch all transfers from the database

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

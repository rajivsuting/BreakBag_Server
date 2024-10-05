const Quote = require("../models/quote");

exports.createQuote = async (req, res) => {
  try {
    const { travellers, destination, startDate, endDate, status } = req.body;

    // Validate required fields
    if (!travellers || travellers.length === 0) {
      return res
        .status(400)
        .json({ message: "Travellers list cannot be empty." });
    }
    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }
    if (!startDate || startDate.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one start date is required." });
    }
    if (!endDate || endDate.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one end date is required." });
    }

    // Calculate duration in days (difference between startDate and endDate)
    const start = new Date(startDate[0]);
    const end = new Date(endDate[0]);

    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." });
    }

    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Calculate duration in days (including both start and end date)

    // Create a new quote record in the database
    const newQuote = await Quote.create({
      travellers,
      destination,
      numberOfTravellers: travellers.length, // Set number of travellers dynamically
      startDate,
      endDate,
      duration, // Calculated duration in days
      status, // Set the status from the request body or use the default value
    });

    // Send a success response
    return res.status(201).json({
      message: "Quote created successfully",
      data: newQuote,
    });
  } catch (err) {
    console.error("Error creating quote:", err);
    return res
      .status(500)
      .json({ message: "Error creating quote", error: err.message });
  }
};

exports.getAllQuotes = async (req, res) => {
  try {
    // Fetch all quotes and populate the traveller and destination details
    const quotes = await Quote.find()
      .populate("travellers", "name email") // Populate traveller's name and email
      .populate("destination", "title"); // Populate destination title

    if (!quotes || quotes.length === 0) {
      return res.status(404).json({ message: "No quotes found." });
    }

    // Send a success response with the retrieved data
    return res.status(200).json({
      message: "Quotes retrieved successfully",
      data: quotes,
    });
  } catch (err) {
    console.error("Error fetching quotes:", err);
    return res
      .status(500)
      .json({ message: "Error fetching quotes", error: err.message });
  }
};

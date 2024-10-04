const Quote = require("../models/quote");

exports.createQuote = async (req, res) => {
  try {
    const { travellers, destination, travelDates, duration, status } = req.body;

    // Validate required fields
    if (!travellers || travellers.length === 0) {
      return res
        .status(400)
        .json({ message: "Travellers list cannot be empty." });
    }
    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }
    if (!travelDates || travelDates.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one travel date is required." });
    }
    if (!duration || duration < 1) {
      return res
        .status(400)
        .json({ message: "Duration must be at least 1 day." });
    }

    // Create a new quote record in the database
    const newQuote = await Quote.create({
      travellers,
      destination,
      numberOfTravellers: travellers.length, // Set number of travellers dynamically
      travelDates,
      duration,
      status, // Set the initial status from the request body or use the default value
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

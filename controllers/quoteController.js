const Quote = require("../models/quote");
const { generatePDF } = require("../service/pdfService");

exports.createQuote = async (req, res) => {
  try {
    const { travellers, destination, startDate, endDate } = req.body;
    const { userId } = req.user;

    if (!travellers || travellers.length === 0) {
      return res
        .status(400)
        .json({ message: "Travellers list cannot be empty." });
    }
    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }
    if (!startDate) {
      return res.status(400).json({ message: "Start date is required." });
    }
    if (!endDate) {
      return res.status(400).json({ message: "End date is required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (end < start) {
      return res.status(400).json({
        message: "End date must be after or equal to the start date.",
      });
    }

    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const newQuote = await Quote.create({
      travellers,
      destination,
      numberOfTravellers: travellers.length,
      startDate,
      endDate,
      duration,
      createdBy: userId,
    });

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
    const { userId } = req.user;
    const { role } = req.user;
    // console.log("get",req.user)
    let quotes;
    if (role === "Admin") {
      quotes = await Quote.find()
        .populate("travellers", "name email") // Populate traveller's name and email
        .populate("destination", "title")
        .populate({
          path: "comments.author", // Populate author field within comments
          select: "name email", // Only retrieve name and email from the User model
        })
        .populate("createdBy");
    } else {
      quotes = await Quote.find({ createdBy: userId })
        .populate("travellers", "name email") // Populate traveller's name and email
        .populate("destination", "title")
        .populate({
          path: "comments.author", // Populate author field within comments
          select: "name email", // Only retrieve name and email from the User model
        })
        .populate("createdBy");
    }
    // Fetch all quotes and populate the traveller and destination details

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

exports.getQuoteByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Validate if tripId is provided
    if (!tripId) {
      return res.status(400).json({ message: "Trip ID is required." });
    }

    // Fetch the quote by tripId from the database
    const quote = await Quote.findOne({ tripId })
      .populate("travellers", "name userType email")
      .populate("destination")
      .populate({
        path: "comments.author",
        select: "name email",
      })
      .populate("createdBy");

    if (!quote) {
      return res
        .status(404)
        .json({ message: `No quote found for Trip ID: ${tripId}` });
    }

    return res.status(200).json({
      message: "Quote retrieved successfully",
      data: quote,
    });
  } catch (err) {
    console.error("Error retrieving quote:", err);
    return res.status(500).json({
      message: "Error retrieving quote",
      error: err.message,
    });
  }
};

exports.createCommentOnQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { comment } = req.body;
    const { userId } = req.user;

    if (!quoteId) {
      return res.status(400).json({ message: "Quote ID is required." });
    }

    if (!comment) {
      return res.status(400).json({ message: "Comment is required." });
    }

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res
        .status(404)
        .json({ message: `No quote found for Quote ID: ${quoteId}` });
    }

    const newComment = {
      content: comment,
      author: userId,
      createdAt: new Date(),
    };

    quote.comments.push(newComment);
    await quote.save();

    return res.status(200).json({
      message: "Comment created successfully",
      data: quote,
    });
  } catch (err) {
    console.error("Error creating comment on quote:", err);
    return res
      .status(500)
      .json({ message: "Error creating comment on quote", error: err.message });
  }
};

exports.createIntenerary = async (req, res) => {
  const {
    travelSummaryPerDay,
    priceDetails,
    selectedHotel,
    selectedExclusions,
    selectedOtherInformation,
    selectedTransfers,
    selectedInclusions,
    activityPerDay,
    destinationOnly,
    quote,
  } = req.body;
  try {
    const travelSummaryDemo = travelSummaryPerDay.map((item) => ({
      title: item.summaryDetails.title,
      description: item.summaryDetails.description,
    }));

    const hotelData = selectedHotel.map((hotel) => ({
      name: hotel.name,
      checkInDate: hotel.checkInDate,
      checkOutDate: hotel.checkOutDate,
      location: hotel.formatted_address,
      mealPlan: hotel.mealPlan,
      numberOfGuest: parseInt(hotel.numberOfGuest),
      roomType: hotel.roomType,
    }));

    const detailedItineraryData = activityPerDay.map((activity) => ({
      title: activity.summaryDetails.title,
      description: activity.summaryDetails.description,
      images: activity.summaryDetails.images,
    }));

    const otherInfoData = selectedOtherInformation.map(
      (info) => info.description
    );

    const exclusionsData = selectedExclusions.map(
      (exclusion) => exclusion.description
    );

    const transfersProcessData = selectedTransfers.map(
      (transfer) => transfer.description
    );

    // console.log(selectedInclusions);

    const inclusionData = {
      itemList: selectedInclusions.map((item) => ({
        title: item.title,
        description: item.description,
      })),
    };
    // console.log(inclusionData);

    const exist = await Quote.findById(quote._id);

    exist.itenerary = req.body;

    await exist.save();

    let startDate = new Date(quote.startDate).toLocaleDateString();
    let endDate = new Date(quote.endDate).toLocaleDateString();

    await generatePDF(
      res,
      travelSummaryDemo,
      priceDetails,
      detailedItineraryData,
      inclusionData,
      exclusionsData,
      otherInfoData,
      hotelData,
      transfersProcessData,
      destinationOnly,
      startDate,
      endDate
    );
  } catch (error) {
    console.error("Error creating intenerary:", error);
    return res.status(500).json({
      message: "Error creating intenerary",
      error: error.message,
    });
  }
};

exports.editQuote = async (req, res) => {
  try {
    const { id } = req.params; // Quote ID from URL params
    const { travellers, destination, startDate, endDate, status } = req.body;

    // Find the existing quote by ID

    const existingQuote = await Quote.findById(id);
    if (!existingQuote) {
      return res.status(404).json({ message: "Quote not found." });
    }

    // Validate travellers array if provided
    if (travellers && travellers.length === 0) {
      return res
        .status(400)
        .json({ message: "Travellers list cannot be empty." });
    }

    // Validate destination if provided
    if (destination === "") {
      return res.status(400).json({ message: "Destination cannot be empty." });
    }

    // Validate and parse dates if provided
    let start, end, duration;
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid start date format." });
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid end date format." });
      }
    }

    // Check if end date is after start date
    if (startDate && endDate && end < start) {
      return res.status(400).json({
        message: "End date must be after or equal to the start date.",
      });
    }

    // Calculate duration if both dates are provided
    if (startDate && endDate) {
      duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Update fields on the existing quote
    const updatedQuote = await Quote.findByIdAndUpdate(
      id,
      {
        ...(travellers && {
          travellers,
          numberOfTravellers: travellers.length,
        }),
        ...(destination && { destination }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(duration && { duration }),
        ...(status && { status }),
      },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      message: "Quote updated successfully",
      data: updatedQuote,
    });
  } catch (err) {
    console.error("Error updating quote:", err);
    return res
      .status(500)
      .json({ message: "Error updating quote", error: err.message });
  }
};

exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters

    // Find and delete the quote by ID
    const deletedQuote = await Quote.findByIdAndDelete(id);

    // If no record is found, return a 404 error
    if (!deletedQuote) {
      return res.status(404).json({
        message: "Quote not found.",
      });
    }

    // Send a success response
    return res.status(200).json({
      message: "Quote deleted successfully",
      data: deletedQuote,
    });
  } catch (err) {
    console.error("Error deleting quote:", err);
    return res.status(500).json({
      message: "Error deleting quote",
      error: err.message,
    });
  }
};

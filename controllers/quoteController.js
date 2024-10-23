const Quote = require("../models/quote");
const { generatePDF } = require("../service/pdfService");

exports.createQuote = async (req, res) => {
  try {
    const { travellers, destination, startDate, endDate } = req.body;
    const { userId } = req.user;
    // console.log("post",req.user)

    // Validate required fields
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

    // Parse the start and end dates correctly
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure valid date objects
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    // Ensure the end date is after or the same as the start date
    if (end <= start) {
      return res
        .status(400)
        .json({ message: "End date must be after the start date." });
    }

    // Calculate duration in days (excluding the end date)
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Duration in days (excluding end date)

    // Create a new quote record in the database
    const newQuote = await Quote.create({
      travellers,
      destination,
      numberOfTravellers: travellers.length, // Set number of travellers dynamically
      startDate,
      endDate,
      duration, // Calculated duration in days
      createdBy: userId,
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
        }).populate("createdBy");;
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
    const quote = await Quote.findOne({ tripId }).populate("travellers", "name email") // Populate traveller's name and email
    .populate("destination")
    .populate({
      path: "comments.author", // Populate author field within comments
      select: "name email", // Only retrieve name and email from the User model
    })
    .populate("createdBy");

    // If no quote is found, return a 404 response
    if (!quote) {
      return res
        .status(404)
        .json({ message: `No quote found for Trip ID: ${tripId}` });
    }

    // Send a success response with the quote data
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
    const { comment } = req.body; // Assume this contains the comment content
    const { userId } = req.user; // The logged-in user's ID

    // Validate if quoteId is provided
    if (!quoteId) {
      return res.status(400).json({ message: "Quote ID is required." });
    }

    if (!comment) {
      return res.status(400).json({ message: "Comment is required." });
    }

    // Fetch the quote by quoteId from the database
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res
        .status(404)
        .json({ message: `No quote found for Quote ID: ${quoteId}` });
    }

    // Add the comment to the quote's comments array
    const newComment = {
      content: comment, // Ensure this is the comment content
      author: userId, // Reference to the user making the comment
      createdAt: new Date(), // Date will default to `Date.now` in the schema, so you could omit this
    };

    quote.comments.push(newComment);
    await quote.save();

    // Send a success response with the updated quote data
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
      location: hotel.vicinity, // using 'vicinity' as 'location'
      mealPlan: hotel.mealPlan,
      numberOfGuest: parseInt(hotel.numberOfGuest), // converting to number
      roomType: hotel.roomType,
    }));

    const detailedItineraryData = activityPerDay.map((activity) => ({
      title: activity.summaryDetails.title,
      description: activity.summaryDetails.description,
      images: activity.summaryDetails.images, // No default images needed
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

    const inclusionData = {
      itemList: selectedInclusions.map((inclusion) => {
        let descriptionArray = [inclusion.description]; // Convert description into array

        return {
          title: inclusion.title, // Map title as is
          description: descriptionArray, // Add description inside an array
        };
      }),
    };

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
      destinationOnly
    );
  } catch (error) {
    console.error("Error creating intenerary:", error);
    return res.status(500).json({
      message: "Error creating intenerary",
      error: error.message,
    });
  }
};


exports.editquote =async (req, res) => {
  const { quoteid } = req.params;
  const updateData = req.body;

  try {
    // Find the document by ID and update it
    const updatedQuote = await Quote.findByIdAndUpdate(
      quoteid,
      { $set: updateData }, // Only updates the fields provided in the request body
      { new: true, runValidators: true } // Returns the updated document and runs schema validators
    );

    if (!updatedQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.status(200).json({ message: "Quote updated successfully", updatedQuote });
  } catch (error) {
    res.status(400).json({ message: "Error updating quote", error: error.message });
  }
};
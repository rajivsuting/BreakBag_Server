require("dotenv").config();
const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const travellerRoutes = require("./routes/travellerRoutes");
const travelSummaryRoutes = require("./routes/travelSummaryRoutes");
const activityRoutes = require("./routes/activityRoutes");
const inclusionRoutes = require("./routes/inclusionRoutes");
const exclusionRoutes = require("./routes/exclusionRoutes");
const transferRoutes = require("./routes/transferRoutes");
const otherInformationRoutes = require("./routes/otherInformationRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const userRoutes = require("./routes/userRoutes");
const logger = require("./config/logger");
const connectDB = require("./db/connectDB");
const Fuse = require("fuse.js");

const cookieParser = require("cookie-parser");
const { protect } = require("./middleware/authMiddleware");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/validateToken", protect, (req, res) => {
  try {
    res.send("Working");
  } catch (error) {
    res.send(error);
  }
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/destination", destinationRoutes);
app.use("/api/traveller", travellerRoutes);
app.use("/api/travel-summary", travelSummaryRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/inclusion", inclusionRoutes);
app.use("/api/exclusion", exclusionRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/other-information", otherInformationRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/agent", userRoutes);
app.use("/api/pdf", pdfRoutes);

// Route to search for a hotel by name
app.get("/search-hotel", async (req, res) => {
  const { hotelName } = req.query;

  if (!hotelName) {
    return res.status(400).json({ error: "Hotel name is required" });
  }

  try {
    // Google Places API URL
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      hotelName
    )}&type=lodging&key=${process.env.GOOGLE_API_KEY}`;

    // Fetch data from Google Places API
    const response = await axios.get(url);

    // Send back the hotel data
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

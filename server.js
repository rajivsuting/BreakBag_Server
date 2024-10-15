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

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

connectDB();

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

app.get("/hotels", async (req, res) => {
  const { location, radius = 5000, type = "lodging" } = req.query;
  const apiKey = "AIzaSyBSDhdL2tinLiAKRk7w9JhDAv5gAQXFMIk";
  console.log(location, radius, type);
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.results);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching data from Google Places API" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

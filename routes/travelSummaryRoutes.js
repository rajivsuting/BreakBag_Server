const express = require("express");
const router = express.Router();
const travelSummaryController = require("../controllers/travelSummaryController");

// Create a new Travel Summary
router.post("/travel-summary", travelSummaryController.createTravelSummary);

// Get all Travel Summaries with Pagination
router.get("/travel-summary", travelSummaryController.getAllTravelSummary);
router.get("/search", travelSummaryController.searchTravelSummariesByKeyword);

router.put("/edit/:id", travelSummaryController.editTravelSummary);

router.delete("/delete/:id", travelSummaryController.deleteTravelSummary);

module.exports = router;

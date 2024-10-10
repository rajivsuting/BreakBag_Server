const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/quoteController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Route to create a new quote
router.post("/quotes", quoteController.createQuote);

// Route to get all quotes
router.get("/quotes", quoteController.getAllQuotes);

router.get("/quotes/:tripId", quoteController.getQuoteByTripId);

router.post(
  "/:quoteId/comments",
  protect,
  restrictTo("Agent"),
  quoteController.createCommentOnQuote
);

module.exports = router;

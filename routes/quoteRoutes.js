const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/quoteController");

// Route to create a new quote
router.post("/quotes", quoteController.createQuote);

// Route to get all quotes
router.get("/quotes", quoteController.getAllQuotes);

module.exports = router;

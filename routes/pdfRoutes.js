const express = require("express");
const { generatePDF } = require("../service/pdfService");
const router = express.Router();

// Route to generate PDF
router.get("/generate", async (req, res) => {
  try {
    // Generate the PDF and send it in response
    await generatePDF(res);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Failed to generate PDF");
  }
});

module.exports = router;

const PDFDocument = require("pdfkit");
const axios = require("axios");

// Helper function to fetch image data
async function fetchImage(url) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch logo image");
  }
}

// Function to generate the PDF
async function generatePDF(res) {
  // Create a new PDF document with A4 size
  const doc = new PDFDocument({ size: "A4" });

  // Set the response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=dummy.pdf");

  // Pipe the PDF into the response
  doc.pipe(res);

  // Fetch the logo image from the URL
  const logoUrl =
    "https://breakbag.com/static/media/logo.3fff3126fefbf4f3afe7.png";
  const logoImage = await fetchImage(logoUrl);

  // Add the logo to the top right of the PDF
  // Adjust the positioning to make sure it appears once in the top-right corner
  doc.image(logoImage, doc.page.width - 150, 20, { fit: [100, 100] });

  // Add dummy text
  doc
    .fontSize(20)
    .text("Dummy PDF Document", { align: "center", valign: "center" })
    .moveDown(2)
    .fontSize(12)
    .text("This is a sample PDF document generated using Node.js and PDFKit.", {
      align: "left",
    })
    .moveDown()
    .text(
      "The logo is displayed at the top right corner, and this text serves as a placeholder for your content."
    );

  // Finalize the PDF
  doc.end();
}

module.exports = { generatePDF };

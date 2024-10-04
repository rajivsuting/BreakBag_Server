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
    throw new Error("Failed to fetch image");
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

  // Define padding on all sides
  const padding = 20; // 20px padding on all sides

  // Define the width for text (60%) and images (40%)
  const textWidth = (doc.page.width - 2 * padding) * 0.6;
  const imageWidth = (doc.page.width - 2 * padding) * 0.4;
  const leftRightMargin = 10; // Space between the text and the images

  // Add the text to the left 60% of the PDF, within the padding boundary

  // Heading with "PDF" in cursive (italic)
  doc
    .fontSize(20)
    .font("Times-Roman") // Regular font for "Dummy "
    .text("Dummy ", padding, padding + 80, { continued: true })
    .font("Times-Italic") // Cursive/italic for "PDF"
    .text("PDF", { continued: true })
    .font("Times-Roman") // Back to regular font for "Document"
    .text(" Document", { align: "left", width: textWidth - leftRightMargin });

  // Additional content
  doc
    .moveDown(2)
    .fontSize(12)
    .text(
      "This is a sample PDF document generated using Node.js and PDFKit.",
      padding,
      doc.y, // Continue from the previous text position
      { align: "left", width: textWidth - leftRightMargin }
    )
    .moveDown(3)
    .text(
      "The logo is displayed at the top right corner, and this text serves as a placeholder for your content.",
      padding,
      doc.y, // Continue from the previous text position
      { align: "left", width: textWidth - leftRightMargin }
    );

  // Fetch the image to be displayed three times in a circular format
  const imageUrl =
    "https://admin-bucket.blr1.cdn.digitaloceanspaces.com/1727765914092-signup.png";
  const imageData = await fetchImage(imageUrl);

  // Get the height of the PDF document considering the padding
  const pageHeight = doc.page.height - 2 * padding;
  const sectionHeight = pageHeight / 3;
  const circleDiameter = imageWidth - 20; // Adjust the circle diameter based on the image width
  const imageXPosition = padding + textWidth + leftRightMargin; // Adjust X position for images on the right 40%

  // Draw 3 circular images in the right 40% half, spaced vertically and respecting the padding
  for (let i = 0; i < 3; i++) {
    const yPosition =
      padding + i * sectionHeight + sectionHeight / 2 - circleDiameter / 2;

    // Clip the image into a circular shape
    doc
      .save()
      .circle(
        imageXPosition + circleDiameter / 2,
        yPosition + circleDiameter / 2,
        circleDiameter / 2
      )
      .clip()
      .image(imageData, imageXPosition, yPosition, {
        width: circleDiameter,
        height: circleDiameter,
      })
      .restore();
  }

  // Fetch the logo image from the URL
  const logoUrl =
    "https://breakbag.com/static/media/logo.3fff3126fefbf4f3afe7.png";
  const logoImage = await fetchImage(logoUrl);

  // Add the logo to the top right of the PDF, overlaying all content but respecting padding
  doc.image(logoImage, doc.page.width - padding - 100, padding, {
    fit: [100, 100],
  });

  // Finalize the PDF
  doc.end();
}

module.exports = { generatePDF };

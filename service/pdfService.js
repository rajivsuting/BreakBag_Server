const PDFDocument = require("pdfkit");
const axios = require("axios");
const path = require("path");

// Helper function to fetch image data from a URL
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
  try {
    // Create a new PDF document with A4 size
    const doc = new PDFDocument({ size: "A4" });

    // Set the response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=dummy.pdf");

    // Pipe the PDF into the response
    doc.pipe(res);

    // Define padding on all sides
    const padding = 30;

    // --- Second Page ---

    // Fetch the logo image from the URL
    const logoUrl =
      "https://breakbag.com/static/media/logo.3fff3126fefbf4f3afe7.png";
    const logoImage = await fetchImage(logoUrl);

    // Add the logo to the top right of the first page
    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    // Add the heading "Why Choose BreakBag" on the same line
    const whyText = "WHY ";
    const breakBagText = " BREAKBAG? ";
    const chooseText = "Choose";

    // Set font for each text segment and calculate widths
    doc.font("Times-Bold").fontSize(24);
    const whyTextWidth = doc.widthOfString(whyText);
    const breakBagTextWidth = doc.widthOfString(breakBagText);

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(24);
    const chooseTextWidth = doc.widthOfString(chooseText);

    // Calculate the total width and starting X position to center the text
    const totalWidth = whyTextWidth + chooseTextWidth + breakBagTextWidth;
    let xPosition = (doc.page.width - totalWidth) / 2;
    xPosition -= 30;
    const chooseTextYPosition = 70 - 10;

    // Print all parts on the same line
    doc
      .font("Times-Bold")
      .fontSize(30)
      .fillColor("#123345")
      .text(whyText, xPosition, 70, { continued: true });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(32)
      .fillColor("#fab701")
      .text(chooseText, xPosition, chooseTextYPosition, { continued: true });

    doc
      .font("Times-Bold")
      .fontSize(30)
      .fillColor("#123345")
      .text(breakBagText, xPosition, 70);

    doc.moveDown(1); // Add space below the heading

    // Reset font to default for the paragraphs
    doc.font("Times-Roman").fontSize(12).fillColor("black");

    // Add 6 paragraphs of dummy text, aligned left
    const paragraphs = [
      "BreakBag is your premier choice for travel solutions. Our dedicated team focuses on providing exceptional customer service, ensuring that your journey is smooth and enjoyable.",
      "With tailored itineraries, competitive pricing, and innovative solutions, we aim to exceed your expectations. Trust us to handle all your travel needs, from planning to execution.",
      "Our commitment to quality ensures that every detail is taken care of. Join countless satisfied customers who have experienced the difference with BreakBag.",
      "Choose us for an unforgettable travel experience that prioritizes your satisfaction and convenience. We understand that every traveler is unique, and we cater to your individual preferences.",
      "From luxurious getaways to budget-friendly trips, our services are designed to meet your needs. Enjoy personalized itineraries that suit your schedule and interests.",
      "Let BreakBag be your travel partner, guiding you through the best destinations while providing support at every step. Experience the joy of traveling with a team that cares about your journey.",
    ];

    // Loop through paragraphs and add them to the PDF
    for (const para of paragraphs) {
      doc
        .moveDown(1) // Move down for spacing between paragraphs
        .text(para, 70, doc.y, {
          align: "justify",
          width: doc.page.width - 2 * 70,
        });
    }

    const rectHeight = 50; // Height of the rectangle
    const rectYPosition = doc.page.height - padding - rectHeight - 120; // Position of the rectangle

    // Calculate the midpoint to divide the rectangle into two halves
    const rectMidPoint = doc.page.width / 2;

    // Draw the left half of the rectangle with color #123345
    doc.rect(0, rectYPosition, rectMidPoint, rectHeight).fill("#123345");

    // Draw the right half of the rectangle with color #fab701
    doc
      .rect(rectMidPoint, rectYPosition, rectMidPoint, rectHeight)
      .fill("#fab701");

    // Add "Our Rating" text centered in the left half of the rectangle
    doc
      .fontSize(20)
      .fillColor("white")
      .font("Times-Bold")
      .text("OUR RATING", 0, rectYPosition + 15, {
        align: "center", // Center the text horizontally in the specified width
        width: rectMidPoint, // Limit the text's width to the left half of the rectangle
      });

    // Add "Recognition" text centered in the right half of the rectangle
    doc
      .fontSize(20)
      .fillColor("white")
      .font("Times-Bold")
      .text("RECOGNITION", rectMidPoint, rectYPosition + 15, {
        align: "center", // Center the text horizontally in the specified width
        width: rectMidPoint, // Limit the text's width to the right half of the rectangle
      });

    // --- Adding the ratings image at the bottom ---
    const ratingsImagePath = path.join(
      __dirname,
      "..",
      "images",
      "ratings.png"
    );
    const imageWidth = 200; // Set your desired width
    const imageYPosition = doc.page.height - padding - rectHeight - 30; // Position above the rectangle
    doc.image(
      ratingsImagePath,
      (doc.page.width - imageWidth) / 2,
      imageYPosition,
      {
        width: imageWidth,
      }
    );

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

module.exports = { generatePDF };

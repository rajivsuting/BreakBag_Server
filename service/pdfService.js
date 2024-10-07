const PDFDocument = require("pdfkit");
const axios = require("axios");
const path = require("path");
const { travelSummaryDemo, costData } = require("../data.js");

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

    // --- First Page ---

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
    xPosition -= 40;
    const chooseTextYPosition = 70 - 18;

    // Print all parts on the same line
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#123345")
      .text(whyText, xPosition, 70, { continued: true });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#fab701")
      .text(chooseText, xPosition - 11, chooseTextYPosition + 2, {
        continued: true,
      });

    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#123345")
      .text(breakBagText, xPosition - 20, 70);

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

    // --- Add Second Page ---
    doc.addPage();

    // Add the same logo on the top right of the second page
    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    // --- "Brief ITINERARY" Centered on the Same Line ---
    const briefText = "Brief";
    const itineraryText = " ITINERARY";

    // Set font for "Brief" and calculate its width
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(32);
    const briefTextWidth = doc.widthOfString(briefText);

    // Set font for "ITINERARY" and calculate its width
    doc.font("Times-Bold").fontSize(32);
    const itineraryTextWidth = doc.widthOfString(itineraryText);

    // Calculate total width of the text and center it
    const totalHeadingWidth = briefTextWidth + itineraryTextWidth;
    const headingXPosition = (doc.page.width - totalHeadingWidth) / 2;

    // Print "Brief" with y-position raised by 20 units and "ITINERARY" on the same line
    const briefYPosition = 70 - 10; // Move "Brief" up by 20 units
    const itineraryYPosition = 70; // Keep "ITINERARY" at the default position

    // Print "Brief"
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#fab701")
      .text(briefText, headingXPosition, briefYPosition - 5, {
        continued: true,
      });

    // Print "ITINERARY"
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#123345")
      .text(
        itineraryText,
        headingXPosition + briefTextWidth - 70, // Adjusted X position for "ITINERARY"
        itineraryYPosition
      );

    // Add a horizontal line below the heading on the second page
    const lineYPosition = itineraryYPosition + 55; // Adjust as needed for spacing
    doc
      .moveTo(0, lineYPosition) // X position for starting point
      .lineTo(doc.page.width + 70, lineYPosition) // X position for ending point
      .stroke(); // Render the line

    // Define the start date and total days
    const startDate = "2024-10-01"; // Example start date
    const totalDays = travelSummaryDemo.length; // Number of days from the travel summary

    doc
      .moveTo(0, lineYPosition) // X position for starting point
      .lineTo(doc.page.width + 70, lineYPosition) // X position for ending point
      .stroke(); // Render the line

    // Add the new fields below the horizontal line
    const startDate2 = `Start Date : ${startDate}`; // Example start date
    const endDate = "End Date: 2024-10-05"; // Example end date
    const destination = "Destination: Paris"; // Example destination

    // Set font for the new fields
    doc.font("Times-Roman").fontSize(14).fillColor("black");

    // Position for the text
    const textYPosition = lineYPosition + 20;

    // Print Start Date
    doc.text(startDate2, padding, textYPosition, { continued: true });

    // Add space between Start Date and End Date
    const spaceBetween = 100; // Adjust as needed for spacing
    doc.text(" ".repeat(spaceBetween / 10), padding, textYPosition, {
      continued: true,
    });

    // Print End Date
    doc.text(endDate, padding + 170, textYPosition);

    // Print Destination
    doc.text(destination, padding, doc.y + 10); // Below the End Date

    // Add a horizontal second line below the destination
    const destinationLineYPosition = doc.y + 15; // Adjust the Y position for the line
    doc
      .moveTo(0, destinationLineYPosition) // X position for starting point
      .lineTo(doc.page.width, destinationLineYPosition) // X position for ending point
      .stroke(); // Render the line

    const startYPosition = lineYPosition + 120; // Start just below the line
    let currentYPosition = startYPosition; // Set the initial Y position

    const dayWidth = 60; // Set width for the left side for "Day X"

    // Helper function to add days to a date
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    // Loop through the travel summaries and add them to the PDF
    // Loop through the travel summaries and add them to the PDF
    travelSummaryDemo.forEach((summary, index) => {
      const dayText = `Day ${index + 1}`;

      // Calculate the date for the current day
      const currentDayDate = addDays(new Date(startDate), index);
      const formattedDate = currentDayDate.toISOString().split("T")[0]; // Format date as YYYY-MM-DD

      // Define rectangle dimensions
      const rectHeight = 30; // Height of the rectangle
      const rectYPosition = currentYPosition; // Y position of the rectangle

      // Draw the rectangle background for the day text
      doc
        .fillColor("#123345") // Set the fill color to black
        .rect(padding - 5, rectYPosition, dayWidth, rectHeight) // Define the rectangle dimensions
        .fill(); // Fill the rectangle

      // Calculate vertical center position for day text
      const textYPosition = rectYPosition + rectHeight / 2 + 6; // Centering text vertically, +6 for slight adjustment

      // Add the day title on the left side
      doc
        .font("Times-Bold")
        .fontSize(18)
        .fillColor("white") // Change text color to white for contrast
        .text(dayText, padding + 2, textYPosition - 13, {
          width: dayWidth, // Limit width to the left section
          align: "left",
        });

      // Add the date just below the day title
      doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor("black")
        .text(formattedDate, padding - 4, doc.y + 5, {
          width: dayWidth, // Limit width to the left section
          align: "left",
        });

      // Add the title and description on the right side
      doc
        .font("Times-Bold")
        .fontSize(16)
        .fillColor("black")
        .text(summary.title, padding + dayWidth + 20, currentYPosition);

      // Add the description just below the title
      doc
        .font("Times-Roman")
        .fontSize(12)
        .text(summary.description, padding + dayWidth + 20, doc.y + 5, {
          align: "justify",
          width: doc.page.width - padding - (dayWidth + 40), // Limit width on the right side
        });

      // Calculate the height of the travel summary
      const summaryHeight = doc.y - currentYPosition + 5; // Adding 5 for some extra spacing

      // Draw the vertical line
      const lineXPosition = padding + dayWidth + 10; // X position for the vertical line
      const lineStartY = currentYPosition; // Starting Y position
      const lineEndY = currentYPosition + summaryHeight; // Ending Y position
      doc
        .strokeColor("#fab701")
        .moveTo(lineXPosition, lineStartY)
        .lineTo(lineXPosition, lineEndY)

        .stroke(); // Draw the line

      // Update Y position for the next entry
      currentYPosition = doc.y + 20;
    });

    // --- Add Third Page ---
    doc.addPage();

    // Add the same logo on the top right of the second page
    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    // --- "Tour Cost" Centered on the Same Line ---
    const tourText = "TOUR";
    const costText = " Cost";

    // Set font for "Tour" and calculate its width
    doc.font("Times-Bold").fontSize(32);
    const tourTextWidth = doc.widthOfString(tourText);

    // Set font for "Cost" using Sacramento and calculate its width
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const costTextWidth = doc.widthOfString(costText);

    // Calculate total width of the "Tour Cost" text and center it
    const totalCostHeadingWidth = tourTextWidth + costTextWidth;
    const costHeadingXPosition = (doc.page.width - totalCostHeadingWidth) / 2;

    // Print "Tour" with a regular bold font
    const tourYPosition = 70; // Adjust the Y position as needed
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#123345") // Set the color for "Tour"
      .text(tourText, costHeadingXPosition, tourYPosition, {
        continued: true, // To print "Cost" on the same line
      });

    // Print "Cost" with Sacramento font
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#fab701") // Set the color for "Cost"
      .text(
        costText,
        costHeadingXPosition + tourTextWidth - 98,
        tourYPosition - 14
      );

    // Add the cost table below "Tour Cost"
    doc.moveDown(0); // Add some space

    // Define colors for table headers
    const headerBackgroundColor = "#123345";
    const headerTextColor = "#ffffff"; // White text for contrast

    const headers = ["User Type", "Price", "Quantity", "Amount"];
    const columnWidths = [150, 130, 100, 150]; // Column widths
    const rowHeight = 40; // Increased row height for each row
    const startX = padding; // Starting X position for the table
    let currentY = doc.y; // Starting Y position for the table

    // Function to draw a table row (with right border)
    function drawRow(
      y,
      rowHeight,
      colCount = columnWidths.length,
      removeBorders = []
    ) {
      const tableWidth = columnWidths
        .slice(0, colCount)
        .reduce((a, b) => a + b, 0); // Adjust table width based on colCount
      const endX = startX + tableWidth; // End X position for the table

      // Draw the top border of the row
      if (!removeBorders.includes("top")) {
        doc.moveTo(startX, y).lineTo(endX, y).stroke();
      }

      // Draw the vertical borders (including the right border)
      columnWidths.slice(0, colCount).reduce((acc, width, index) => {
        if (!removeBorders.includes(`col${index}`)) {
          doc
            .moveTo(acc, y)
            .lineTo(acc, y + rowHeight)
            .stroke(); // Vertical lines of the row
        }
        return acc + width;
      }, startX);

      // Draw the right border of the row
      if (!removeBorders.includes("right")) {
        doc
          .moveTo(endX, y)
          .lineTo(endX, y + rowHeight)
          .stroke();
      }

      // Draw the bottom border of the row
      if (!removeBorders.includes("bottom")) {
        doc
          .moveTo(startX, y + rowHeight)
          .lineTo(endX, y + rowHeight)
          .stroke();
      }
    }

    // Helper function to vertically center text
    function getVerticalOffset(fontSize, rowHeight) {
      return (rowHeight - fontSize) / 2;
    }

    // **Draw headers with background color and text color**
    doc
      .rect(
        startX,
        currentY,
        columnWidths.reduce((a, b) => a + b, 0),
        rowHeight
      )
      .fill(headerBackgroundColor); // Set the background color for the header row

    doc.font("Times-Bold").fontSize(14).fillColor(headerTextColor); // Set the text color for headers
    headers.forEach((header, i) => {
      const verticalOffset = getVerticalOffset(14, rowHeight); // Center text vertically

      doc.text(
        header,
        startX + columnWidths.slice(0, i).reduce((acc, w) => acc + w, 0),
        currentY + verticalOffset, // Vertical centering
        { width: columnWidths[i], align: "center" } // Horizontal centering
      );
    });

    // Draw header row borders
    drawRow(currentY, rowHeight);

    // Adjust current Y position to start drawing the data rows
    currentY += rowHeight;

    // Set font for data rows
    doc.font("Times-Roman").fontSize(12).fillColor("black");

    // Draw data rows
    costData.forEach((row) => {
      // Draw the row border first (with right border)
      drawRow(currentY, rowHeight);

      const verticalOffset = getVerticalOffset(12, rowHeight); // Center text vertically

      // Insert data into each column for the current row
      doc.text(row.userType, startX, currentY + verticalOffset, {
        width: columnWidths[0],
        align: "center", // Horizontal centering
      });
      doc.text(
        `₹${row.price.toLocaleString("en-IN")}`,
        startX + columnWidths[0],
        currentY + verticalOffset,
        { width: columnWidths[1], align: "center" } // Horizontal centering
      );
      doc.text(
        row.quantity,
        startX + columnWidths[0] + columnWidths[1],
        currentY + verticalOffset,
        { width: columnWidths[2], align: "center" } // Horizontal centering
      );
      doc.text(
        `₹${row.amount.toLocaleString("en-IN")}`,
        startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
        currentY + verticalOffset,
        { width: columnWidths[3], align: "center" } // Horizontal centering
      );

      // Move to the next row's Y position
      currentY += rowHeight;
    });

    // Calculate the total amount
    const totalAmount = costData.reduce((total, row) => total + row.amount, 0);

    // Draw the last row for the total amount, without the second and third column borders
    const totalRowHeight = 40;
    drawRow(currentY, totalRowHeight, 4, ["col1", "col2"]); // Skip borders for the second and third columns

    // Draw the final row that spans 3 columns and displays the total amount
    doc
      .font("Times-Bold")
      .fontSize(14)
      .text(
        "Total Amount",
        startX,
        currentY + getVerticalOffset(14, totalRowHeight),
        {
          width: columnWidths.slice(0, 3).reduce((a, b) => a + b, 0),
          align: "center",
        } // Spanning the first three columns
      );

    // Display the total amount in the last column
    doc.text(
      `${totalAmount.toLocaleString("en-IN")}`,
      startX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0),
      currentY + getVerticalOffset(14, totalRowHeight),
      { width: columnWidths[3], align: "center" }
    );

    // Draw the last row border with the total amount, skipping the second and third columns
    drawRow(currentY, totalRowHeight, 4, ["col1", "col2", "bottom"]); // Skip borders for the second and third columns and bottom

    // Adjust the Y position for future content
    currentY += totalRowHeight;

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

module.exports = { generatePDF };

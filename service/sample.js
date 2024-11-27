const PDFDocument = require("pdfkit");
const axios = require("axios");
const path = require("path");
const { PDFDocument: PDFLibDocument } = require("pdf-lib");

const fs = require("fs");

async function fetchImage(url) {
  try {
    if (!url) throw new Error("Image URL is invalid or empty.");
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return response.data;
  } catch (error) {
    console.error(`Error fetching image from URL (${url}):`, error.message);
    return null; // Fallback to prevent PDF generation failure
  }
}

// Function to generate the PDF
async function generatePDF(
  res,
  travelSummaryDemo,
  costData,
  detailedIteneraryData,
  inclusionData,
  exclusionsData,
  otherInfoData,
  hotelData,
  transfersProcessData,
  destinationOnly,
  start_Date,
  end_Date,
  travelGuide
) {
  try {
    const doc = new PDFDocument({ size: "A4" });
    const buffers = [];

    // Set up to collect data
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      // After generating the main PDF, concatenate with Pdf_1.pdf
      const generatedPdfBuffer = Buffer.concat(buffers);
      const concatenatedPdfBuffer = await concatenatePDFs(generatedPdfBuffer);

      // Send the concatenated PDF as the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=BreakBagItinerary_Concatenated.pdf"
      );
      res.end(concatenatedPdfBuffer);
    });

    // Define padding on all sides
    const padding = 30;

    // --- First Page ---

    const logoImage = path.join(__dirname, "..", "images", "logo.png"); // Adjust path as needed
    const imagePath = await fetchImage(destinationOnly?.image);

    // Get the dimensions of the page
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Add the background image first (covers entire page)
    doc.image(imagePath, 0, 0, {
      width: pageWidth,
      height: pageHeight,
      align: "center", // Optional, to center the image
      valign: "center", // Optional, to center the image vertically
    });

    // Set desired logo width
    const logoWidth = 100; // Adjust the size to fit your design

    // Calculate the position (keeping the image within bounds)
    const logoXPosition = doc.page.width - logoWidth - 10;
    const yPosition = 10;

    // Add the logo on top of the background image
    doc.image(logoImage, logoXPosition, yPosition, {
      width: logoWidth, // Rescale the logo
    });

    // ---------------------Second Page --------------------
    doc.addPage();

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
      .fillColor("#053260")
      .text(whyText, xPosition, 70, { continued: true });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(chooseText, xPosition - 11, chooseTextYPosition + 2, {
        continued: true,
      });

    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(breakBagText, xPosition - 20, 70);

    doc.moveDown(1); // Add space below the heading

    // Reset font to default for the paragraphs
    doc.font("Times-Roman").fontSize(12).fillColor("black");

    // Add 6 paragraphs of dummy text, aligned left
    const paragraphs = [
      "Everyone may don the hat of a traveler, but it's the soulful connection with the destinations, an affection for the mountains, tha truly defines a Traveler.",
      "Nearly a decade ago, BreakBag embarked on a mission to redefine travel, offering a novel approach to exploration. Our vision was simple: to democratize travel, making it accessible to all who dream of traversing the globe,",
      "In an era where communal travel was gaining momentum, our focus remained steadfast: to provide exceptional travel experiences without compromising on affordability.",
      "Specializing in both group departures and tailor-made journeys, BreakBag caters to wanderlust seekers seeking adventures across international and domestic landscapes, including bespoke corporate outings.",
      "At BreakBag, our mission is clear: to deliver unparalleled trvel experiences to our clients. From meticulously selecting the most exceptional accommodations to curating delectable dining options, we spare no effort in ensuring every aspect of your journey exceeds expectations.",
      "Drawing inspiration from out profound love for the beaches to mountains, we seek to impart the invaluable lessons and breathtaking experiences they have bestowed upon us to each and every one of our clients",
    ];

    // Loop through paragraphs and add them to the PDF
    paragraphs.forEach((para, index) => {
      if (index === 0) {
        // For the first paragraph, add quotation marks, make it italic and bold
        doc
          .moveDown(1)
          .font("Times-BoldItalic")
          .fontSize(14)
          .text(`“${para}”`, 70, doc.y, {
            align: "justify",
            width: doc.page.width - 2 * 70,
          });
      } else {
        // For the other paragraphs, regular formatting
        doc
          .moveDown(1)
          .font("Times-Roman")
          .fontSize(14)
          .text(para, 70, doc.y, {
            align: "justify",
            width: doc.page.width - 2 * 70,
          });
      }
    });

    const rectHeight = 50; // Height of the rectangle
    const rectYPosition = doc.page.height - padding - rectHeight - 120; // Position of the rectangle

    // Calculate the midpoint to divide the rectangle into two halves
    const rectMidPoint = doc.page.width / 2;

    // Draw the left half of the rectangle with color #053260
    doc.rect(0, rectYPosition, rectMidPoint, rectHeight).fill("#053260");

    // Draw the right half of the rectangle with color #ff9c00
    doc
      .rect(rectMidPoint, rectYPosition, rectMidPoint, rectHeight)
      .fill("#ff9c00");

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
      .fillColor("#ff9c00")
      .text(briefText, headingXPosition, briefYPosition - 5, {
        continued: true,
      });

    // Print "ITINERARY"
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
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
    let startDate = start_Date; // Example start date

    const totalDays = travelSummaryDemo.length; // Number of days from the travel summary

    doc
      .moveTo(0, lineYPosition) // X position for starting point
      .lineTo(doc.page.width + 70, lineYPosition) // X position for ending point
      .stroke(); // Render the line

    // Add the new fields below the horizontal line
    const startDate2 = `Start Date : ${startDate}`; // Example start date
    const endDate = `End Date: ${end_Date}`; // Example end date
    const destination = `Destination: ${destinationOnly.title}`; // Example destination
    const travelGuideName = `Travel Guide: ${travelGuide}`;

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
    doc.text(endDate, padding + 153, textYPosition);

    // Print Destination
    doc.text(destination, padding, doc.y + 10, { continued: true });

    // Calculate position for Travel Guide
    const travelGuideXPosition = padding + 200; // Same as End Date's x position
    const travelGuideYPosition = textYPosition + 25; // Slightly below the End Date's y position

    // Print Travel Guide
    doc.text(travelGuideName, travelGuideXPosition, travelGuideYPosition);

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
        .fillColor("#053260") // Set the fill color to black
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
        .strokeColor("#ff9c00")
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
      .fillColor("#053260") // Set the color for "Tour"
      .text(tourText, costHeadingXPosition, tourYPosition, {
        continued: true, // To print "Cost" on the same line
      });

    // Print "Cost" with Sacramento font
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00") // Set the color for "Cost"
      .text(
        costText,
        costHeadingXPosition + tourTextWidth - 98,
        tourYPosition - 14
      );

    // Add the cost table below "Tour Cost"
    doc.moveDown(0); // Add some space

    // Define colors for table headers
    const headerBackgroundColor = "#053260";
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
        `${row.price.toLocaleString("en-IN")}`,
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
        `${row.amount.toLocaleString("en-IN")}`,
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
      .fillColor("#053260")
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
    doc
      .fillColor("black")
      .text(
        `${totalAmount.toLocaleString("en-IN")}`,
        startX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0),
        currentY + getVerticalOffset(14, totalRowHeight),
        { width: columnWidths[3], align: "center" }
      );

    // Draw the last row border with the total amount, skipping the second and third columns
    drawRow(currentY, totalRowHeight, 4, ["col1", "col2", "bottom"]); // Skip borders for the second and third columns and bottom

    // Adjust the Y position for future content
    currentY += totalRowHeight;

    // Define page padding and row heights
    const pagePadding = 30;
    const rowHeight1 = 50; // Height of each row (body)
    const rowHeight2 = 40; // Height of the header row
    const columnWidths1 = [140, 60, 60, 110, 55, 50, 55]; // Column widths for each cell

    // Define hotel and info heading
    const hotelText = "HOTEL";
    const infoText = "Information";

    // Set font for "Hotel" and calculate its width
    doc.font("Times-Bold").fontSize(32);
    const hotelTextWidth = doc.widthOfString(hotelText);

    // Set font for "Information" using Sacramento and calculate its width
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const infoTextWidth = doc.widthOfString(infoText);

    // Calculate the X position for centering the "Hotel Information" heading
    const hotelInfoHeadingWidth = hotelTextWidth + infoTextWidth;
    const InfoXPosition = (doc.page.width - hotelInfoHeadingWidth) / 2;
    const hotelYPosition = 300;

    // Print hotel and info heading
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(hotelText, InfoXPosition, hotelYPosition + 10, { continued: true });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(infoText, InfoXPosition + hotelTextWidth - 105, hotelYPosition - 5);

    // Define column headers
    const headers1 = [
      "Hotel Name",
      "Check-In",
      "Check-Out",
      "Location",
      "Meal",
      "Guests",
      "Room",
    ];
    const headerColor = "#FFFFFF"; // White header text color
    // Header background color

    // Calculate the tableTop position based on the height of the heading and a fixed vertical margin
    const headingHeight = hotelYPosition + 60; // Adjust this based on the height of your headings
    const tableTop = headingHeight; // Do not add extra margin, just use the heading height

    // Draw table headers with borders
    headers1.forEach((header, i) => {
      const x =
        pagePadding + columnWidths1.slice(0, i).reduce((a, b) => a + b, 0);

      // Set the header background color and draw the header background
      doc
        .fillColor(headerBackgroundColor)
        .rect(x, tableTop, columnWidths1[i], rowHeight2)
        .fill();

      // Set the header text color and draw the header text in front of the background
      doc
        .font("Helvetica-Bold")
        .fontSize(12) // Increased font size for better visibility
        .fillColor(headerColor)
        .text(header, x + 5, tableTop + 5, {
          width: columnWidths1[i] - 10,
          align: "center", // Center-align the header text horizontally
        });

      // Draw border around each header cell
      doc.rect(x, tableTop, columnWidths1[i], rowHeight2).stroke(); // Draw border
    });

    // Draw data rows with borders
    doc.font("Helvetica").fontSize(10).fillColor("#000"); // Set text color to black for content
    hotelData.forEach((hotel, rowIndex) => {
      const rowY = tableTop + rowHeight2 + rowHeight1 * rowIndex; // Start directly after header

      // Adjust vertical position slightly upwards
      const verticalOffsetY = rowY + rowHeight1 / 2 - 5; // Shift 5 units up

      // Draw each cell in the row with borders and adjust vertical alignment
      doc.text(hotel.name, pagePadding, verticalOffsetY, {
        width: columnWidths1[0],
        align: "center", // Center-align the cell text horizontally
        baseline: "middle", // Center-align the cell text vertically
      });

      doc.text(
        hotel.checkInDate,
        pagePadding + columnWidths1[0],
        verticalOffsetY,
        {
          width: columnWidths1[1],
          align: "center",
          baseline: "middle",
        }
      );
      doc.text(
        hotel.checkOutDate,
        pagePadding + columnWidths1[0] + columnWidths1[1],
        verticalOffsetY,
        {
          width: columnWidths1[2],
          align: "center",
          baseline: "middle",
        }
      );
      doc.text(
        hotel.location,
        pagePadding + columnWidths1[0] + columnWidths1[1] + columnWidths1[2],
        verticalOffsetY,
        {
          width: columnWidths1[3],
          align: "center",
          baseline: "middle",
        }
      );
      doc.text(
        hotel.mealPlan,
        pagePadding +
          columnWidths1[0] +
          columnWidths1[1] +
          columnWidths1[2] +
          columnWidths1[3],
        verticalOffsetY,
        {
          width: columnWidths1[4],
          align: "center",
          baseline: "middle",
        }
      );
      doc.text(
        hotel.numberOfGuest.toString(),
        pagePadding +
          columnWidths1[0] +
          columnWidths1[1] +
          columnWidths1[2] +
          columnWidths1[3] +
          columnWidths1[4],
        verticalOffsetY,
        {
          width: columnWidths1[5],
          align: "center",
          baseline: "middle",
        }
      );
      doc.text(
        hotel.roomType,
        pagePadding + columnWidths1.slice(0, -1).reduce((a, b) => a + b, 0),
        verticalOffsetY,
        {
          width: columnWidths1[6],
          align: "center",
          baseline: "middle",
        }
      );

      // Draw border around each cell
      doc.rect(pagePadding, rowY, columnWidths1[0], rowHeight1).stroke();
      doc
        .rect(
          pagePadding + columnWidths1[0],
          rowY,
          columnWidths1[1],
          rowHeight1
        )
        .stroke();
      doc
        .rect(
          pagePadding + columnWidths1[0] + columnWidths1[1],
          rowY,
          columnWidths1[2],
          rowHeight1
        )
        .stroke();
      doc
        .rect(
          pagePadding + columnWidths1[0] + columnWidths1[1] + columnWidths1[2],
          rowY,
          columnWidths1[3],
          rowHeight1
        )
        .stroke();
      doc
        .rect(
          pagePadding +
            columnWidths1[0] +
            columnWidths1[1] +
            columnWidths1[2] +
            columnWidths1[3],
          rowY,
          columnWidths1[4],
          rowHeight1
        )
        .stroke();
      doc
        .rect(
          pagePadding +
            columnWidths1[0] +
            columnWidths1[1] +
            columnWidths1[2] +
            columnWidths1[3] +
            columnWidths1[4],
          rowY,
          columnWidths1[5],
          rowHeight1
        )
        .stroke();
      doc
        .rect(
          pagePadding + columnWidths1.slice(0, -1).reduce((a, b) => a + b, 0),
          rowY,
          columnWidths1[6],
          rowHeight1
        )
        .stroke();
    });

    let dayCount = 1;
    // Start the detailed itinerary from here
    for (const item of detailedIteneraryData) {
      // Add a new page for each itinerary item
      doc.addPage();

      // Add the same logo on the top right of each page
      doc.image(logoImage, doc.page.width - padding - 100, padding, {
        fit: [100, 100],
      });

      const rectDayHeight = 40; // Reduced height by 20
      const rectDayWidth = 120;
      const rectDayYPosition = doc.page.height - padding - rectDayHeight - 710;

      // Draw the rectangle with color #ff9c00
      doc
        .rect(0, rectDayYPosition, rectDayWidth, rectDayHeight)
        .fill("#ff9c00");

      // Add the text "DAY X" centered in the rectangle
      doc
        .font("Times-Bold")
        .fontSize(24)
        .fillColor("white")
        .text(
          `DAY ${dayCount}`,
          0,
          rectDayYPosition + 10 + rectDayHeight / 2 - 9,
          {
            width: rectDayWidth,
            align: "center",
            baseline: "middle",
          }
        );
      dayCount++;

      let currentY = padding + 100;

      // Define new dimensions for the rectangles and images
      const largeImageWidth = doc.page.width * 0.7 - 2 * padding;
      const sidebarWidth = doc.page.width * 0.3 - 2 * padding + 50;
      const adjustedHeight = 230;
      const largeImageHeight = adjustedHeight;
      const sidebarImageHeight = adjustedHeight / 2.1;
      const gap = 10;

      // Draw a large rectangle for the left image
      doc
        .rect(padding, currentY, largeImageWidth, largeImageHeight)
        .fillAndStroke("#f0f0f0", "#ccc");

      // Draw two sidebar rectangles on the right
      const sidebarXPosition = padding + largeImageWidth + gap;
      doc
        .rect(sidebarXPosition, currentY, sidebarWidth, sidebarImageHeight)
        .fillAndStroke("#f0f0f0", "#ccc");

      doc
        .rect(
          sidebarXPosition,
          currentY + sidebarImageHeight + gap,
          sidebarWidth,
          sidebarImageHeight
        )
        .fillAndStroke("#f0f0f0", "#ccc");

      // Fetch and fit the images into the rectangles
      const largeImageUrl = item.images[0];
      const largeImageData = await fetchImage(largeImageUrl);
      doc.image(largeImageData, padding, currentY, {
        width: largeImageWidth,
        height: largeImageHeight,
      });

      if (item.images[1]) {
        const sidebarImage1Url = item.images[1];
        const sidebarImage1Data = await fetchImage(sidebarImage1Url);
        doc.image(sidebarImage1Data, sidebarXPosition, currentY, {
          width: sidebarWidth,
          height: sidebarImageHeight,
        });
      }

      if (item.images[2]) {
        const sidebarImage2Url = item.images[2];
        const sidebarImage2Data = await fetchImage(sidebarImage2Url);
        doc.image(
          sidebarImage2Data,
          sidebarXPosition,
          currentY + sidebarImageHeight + gap,
          {
            width: sidebarWidth,
            height: sidebarImageHeight,
          }
        );
      }

      // Update currentY to start text below the images without overlapping
      currentY += largeImageHeight + 40;

      // Add the title below the images
      doc.font("Times-Bold").fontSize(24).fillColor("#053260");

      // Calculate the height of the title
      const titleHeight = doc.heightOfString(item.title, {
        width: doc.page.width - 2 * padding,
        align: "left",
      });

      // Render the title text and update currentY to avoid overlap with the description
      doc.text(item.title, padding, currentY, {
        align: "left",
        width: doc.page.width - 2 * padding,
      });
      currentY += titleHeight + 10; // Adding 10 pixels of space after the title

      // Define maximum width for text and indentation
      const maxWidth = doc.page.width - 2 * padding - 20;
      const bulletPointIndent = 35;
      const descriptionIndent = bulletPointIndent + 10;

      // Loop through description items and print with bullet points
      item.description.forEach((desc) => {
        const bulletPoint = "• ";

        doc.font("Times-Roman").fontSize(14).fillColor("black");
        doc.text(bulletPoint, bulletPointIndent, currentY);

        doc.text(desc, descriptionIndent, currentY, {
          width: maxWidth,
          lineGap: 5,
        });

        const itemHeight = doc.heightOfString(desc, { width: maxWidth });
        currentY += itemHeight + 19;
      });
    }

    // --------TRIP Inclusion ---------------------------

    doc.addPage();

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    const TRIPText = "TRIP";
    const inclusionsText = " Inclusions";

    // Set font for "TRIP" and calculate its width
    doc.font("Times-Bold").fontSize(32);
    const TRIPTextWidth = doc.widthOfString(TRIPText);

    // Set font for "inclusions" using Sacramento and calculate its width
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const inclusionsTextWidth = doc.widthOfString(inclusionsText);

    // Calculate total width of the "TRIP inclusions" text
    const totalinclusionsHeadingWidth = TRIPTextWidth + inclusionsTextWidth;

    // Set X position to start from the left side of the page
    const inclusionsHeadingXPosition = 0;

    // Print "TRIP" with a regular bold font
    const TRIPYPosition = 70;
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(TRIPText, inclusionsHeadingXPosition + 30, TRIPYPosition, {
        continued: true,
      });

    // Print "inclusions" with Sacramento font
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(
        inclusionsText,
        inclusionsHeadingXPosition + TRIPTextWidth - 54,
        TRIPYPosition - 15
      );

    // Draw a horizontal line below the heading
    const inclusionsLineYPosition = TRIPYPosition + 35;

    // Increase the length of the line by 50 units
    const lineLengthIncrease = 50;
    doc
      .moveTo(inclusionsHeadingXPosition - 25, inclusionsLineYPosition)
      .lineTo(
        inclusionsHeadingXPosition + totalinclusionsHeadingWidth + 25,
        inclusionsLineYPosition
      ) // Keep the Y position the same
      .lineWidth(1)
      .strokeColor("#000000")
      .stroke();

    let inclusionY = 120;

    for (let i = 0; i < inclusionData.itemList.length; i++) {
      const item = inclusionData.itemList[i];

      // Set the title color based on the index (even or odd)
      const titleColor = i % 2 === 0 ? "#053260" : "#ff9c00";

      // Print the title of the item
      doc
        .font("Times-Bold")
        .fontSize(24)
        .fillColor(titleColor)
        .text(`${item.title} :`, padding + 7, inclusionY, {
          align: "left",
        });

      inclusionY = doc.y + 10; // Space below the title

      // Loop through each description item to print with bullet points
      item.description.forEach((desc) => {
        doc
          .font("Times-Roman")
          .fontSize(14)
          .fillColor("#000000")
          .text(`• ${desc}`, padding + 27, inclusionY, {
            align: "left",
            width: doc.page.width - 2 * padding,
          });

        // Move Y position down for the next bullet point
        inclusionY = doc.y + 5;
      });

      // Add extra space after each item before the next title
      inclusionY += 10;
    }

    // -----------------------------Transfers---------------------------

    // Add a new page for "TRANSFERS Process"
    doc.addPage();

    // Add the logo to the top right of the page (reuse the logoImage variable)
    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    // Set the heading "TRANSFERS" and calculate its width
    const TRANSFERSText = "TRANSFER";
    doc.font("Times-Bold").fontSize(32);
    const TRANSFERSTextWidth = doc.widthOfString(TRANSFERSText);

    // Set the font for "Process" using Sacramento and calculate its width
    const transfersProcessText = "Information";
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const transfersProcessTextWidth = doc.widthOfString(transfersProcessText);

    // Calculate the total width of the "TRANSFERS Process" text
    const totalTransfersHeadingWidth =
      TRANSFERSTextWidth + transfersProcessTextWidth;

    // Set X position to start from the left side of the page
    const transfersHeadingXPosition = 0;

    // Define Y position for the heading
    const TRANSFERSYPosition = 70;

    // Print "TRANSFERS" with a regular bold font
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(TRANSFERSText, transfersHeadingXPosition + 30, TRANSFERSYPosition, {
        continued: true,
      });

    // Print "Process" with Sacramento font
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(
        transfersProcessText,
        transfersHeadingXPosition + TRANSFERSTextWidth - 140,
        TRANSFERSYPosition - 15
      );

    // Draw a horizontal line below the heading
    const transfersLineYPosition = TRANSFERSYPosition + 35;
    doc
      .moveTo(transfersHeadingXPosition - 40, transfersLineYPosition)
      .lineTo(
        transfersHeadingXPosition + totalTransfersHeadingWidth + 40,
        transfersLineYPosition
      )
      .lineWidth(1)
      .strokeColor("#000000")
      .stroke();

    // Set the starting Y position for the bullet points
    let bulletPointYPositionForTransfers = transfersLineYPosition + 35;

    // Define maximum width for the text wrapping (you can adjust this based on your layout)
    const maxWidthForTransfers = 500;

    // Define the transfers process steps

    // Loop through each transfer process step and print it with a bullet point
    transfersProcessData.forEach((item) => {
      // Set the bullet point character (•)
      const bulletPoint = "• ";

      // Set the font size and color for bullet points
      doc.font("Times-Roman").fontSize(14).fillColor("#000000");

      // Print the bullet point first
      doc.text(bulletPoint, 35, bulletPointYPositionForTransfers);

      // Print the description next to the bullet point with automatic text wrapping
      doc.text(item, 45, bulletPointYPositionForTransfers, {
        width: maxWidthForTransfers,
        lineGap: 5,
      });

      // Calculate the height of the wrapped text
      const itemHeight = doc.heightOfString(item, {
        width: maxWidthForTransfers,
      });

      // Increment the Y position for the next bullet point, based on the height of the current item
      bulletPointYPositionForTransfers += itemHeight + 19;
    });

    // ------------------------Exclusions----------------------------
    doc.addPage();

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    const exclusionsText = " Exclusions";

    // Set font for "TRIP" and calculate its width
    doc.font("Times-Bold").fontSize(32);

    // Set font for "exclusions" using Sacramento and calculate its width
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const exclusionsTextWidth = doc.widthOfString(exclusionsText);

    // Calculate total width of the "TRIP exclusions" text
    const totalexclusionsHeadingWidth = TRIPTextWidth + exclusionsTextWidth;

    // Set X position to start from the left side of the page
    const exclusionsHeadingXPosition = 0;

    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(TRIPText, exclusionsHeadingXPosition + 30, TRIPYPosition, {
        continued: true, // To print "exclusions" on the same line
      });

    // Print "exclusions" with Sacramento font
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00") // Set the color for "exclusions"
      .text(
        exclusionsText,
        exclusionsHeadingXPosition + TRIPTextWidth - 54,
        TRIPYPosition - 15
      ); // Adjusted to start from the left

    // Draw a horizontal line below the heading
    const exclusionsLineYPosition = TRIPYPosition + 35; // Adjust the Y position below the text

    // Increase the length of the line by 50 units
    // const lineLengthIncrease = 50;
    doc
      .moveTo(exclusionsHeadingXPosition - 25, exclusionsLineYPosition) // Start point of the line (moved left by 25)
      .lineTo(
        exclusionsHeadingXPosition + totalexclusionsHeadingWidth + 25, // End point of the line (moved right by 25)
        exclusionsLineYPosition
      ) // Keep the Y position the same
      .lineWidth(1) // Set the thickness of the line
      .strokeColor("#000000") // Set the color of the line (black in this case)
      .stroke(); // Draw the line

    // Set the starting Y position for the bullet points
    let bulletPointYPosition = inclusionsLineYPosition + 35; // Adjust as needed

    // Define maximum width for the text wrapping (you can adjust this based on your layout)
    const maxWidth = 500;

    // Loop through each description and print it with a bullet point
    exclusionsData.forEach((item) => {
      // Set the bullet point character (•)
      const bulletPoint = "• ";

      // Set the font size and color for bullet points
      doc
        .font("Times-Roman") // Change font as needed
        .fontSize(14) // Set font size to 14
        .fillColor("#black"); // Set the color for the text

      // Print the bullet point first
      doc.text(bulletPoint, 35, bulletPointYPosition);

      // Print the description next to the bullet point with automatic text wrapping
      doc.text(item, 45, bulletPointYPosition, {
        width: maxWidth, // Set max width for text wrapping
        lineGap: 5, // Set line height between lines of text
      });

      // Calculate the height of the wrapped text
      const itemHeight = doc.heightOfString(item, { width: maxWidth });

      // Increment the Y position for the next bullet point, based on the height of the current item
      bulletPointYPosition += itemHeight + 19; // Add spacing between items
    });

    doc.addPage();

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    const OTHERText = "OTHER";
    const informationText = "Information";

    // Set font for "OTHER" and calculate its width
    doc.font("Times-Bold").fontSize(32);
    const OTHERTextWidth = doc.widthOfString(OTHERText);

    // Set font for "information" using Sacramento and calculate its width
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const informationTextWidth = doc.widthOfString(informationText);

    // Calculate total width of the "OTHER information" text
    const totalinformationHeadingWidth = OTHERTextWidth + informationTextWidth;

    // Set X position to start from the left side of the page
    const informationHeadingXPosition = 0;

    // Print "OTHER" with a regular bold font
    const OTHERYPosition = 70; // Adjust the Y position as needed
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260") // Set the color for "OTHER"
      .text(OTHERText, informationHeadingXPosition + 30, OTHERYPosition, {
        continued: true, // To print "information" on the same line
      });

    // Print "information" with Sacramento font
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00") // Set the color for "information"
      .text(
        informationText,
        informationHeadingXPosition + OTHERTextWidth - 75,
        OTHERYPosition - 15
      ); // Adjusted to start from the left

    // Draw a horizontal line below the heading
    const informationLineYPosition = OTHERYPosition + 35; // Adjust the Y position below the text

    // Increase the length of the line by 50 units (25 on each side)
    // const lineLengthIncrease = 50;

    doc
      .moveTo(informationHeadingXPosition - 40, informationLineYPosition) // Start point of the line (moved left by 25)
      .lineTo(
        informationHeadingXPosition + totalinformationHeadingWidth + 40, // End point of the line (moved right by 25)
        informationLineYPosition
      ) // Keep the Y position the same
      .lineWidth(1) // Set the thickness of the line
      .strokeColor("#000000") // Set the color of the line (black in this case)
      .stroke(); // Draw the line

    // -------------------Other info ---------------------

    // Set the starting Y position for the "OTHER Information" bullet points
    let bulletPointYPositionForOtherInfo = informationLineYPosition + 35; // Adjust as needed

    // Define maximum width for the text wrapping (you can adjust this based on your layout)
    const maxWidthForOtherInfo = 500;

    // Loop through each description and print it with a bullet point
    otherInfoData.forEach((item) => {
      // Set the bullet point character (•)
      const bulletPoint = "• ";

      // Set the font size and color for bullet points
      doc
        .font("Times-Roman") // Change font as needed
        .fontSize(14) // Set font size to 14
        .fillColor("#000000"); // Set the color for the text

      // Print the bullet point first
      doc.text(bulletPoint, 35, bulletPointYPositionForOtherInfo);

      // Print the description next to the bullet point with automatic text wrapping
      doc.text(item, 45, bulletPointYPositionForOtherInfo, {
        width: maxWidthForOtherInfo, // Set max width for text wrapping
        lineGap: 5, // Set line height between lines of text
      });

      // Calculate the height of the wrapped text
      const itemHeight = doc.heightOfString(item, {
        width: maxWidthForOtherInfo,
      });

      // Increment the Y position for the next bullet point, based on the height of the current item
      bulletPointYPositionForOtherInfo += itemHeight + 19; // Add spacing between items
    });

    doc.end();
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=BreakBagItenerary.pdf"
    // );

    // // Pipe the PDF into the response
    // doc.pipe(res);
    // res.end(mergedPdfBytes);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

// Helper function to concatenate PDFs
async function concatenatePDFs(generatedPdfBuffer) {
  try {
    const generatedPdfDoc = await PDFLibDocument.load(generatedPdfBuffer);
    const additionalPdfPath = path.join(__dirname, "Pdf.pdf");
    const additionalPdfBytes = fs.readFileSync(additionalPdfPath);
    const additionalPdfDoc = await PDFLibDocument.load(additionalPdfBytes);

    const concatenatedPdfDoc = await PDFLibDocument.create();

    // Copy all pages from the generated PDF
    const generatedPages = await concatenatedPdfDoc.copyPages(
      generatedPdfDoc,
      generatedPdfDoc.getPageIndices()
    );
    generatedPages.forEach((page) => concatenatedPdfDoc.addPage(page));

    // Copy all pages from Pdf_1.pdf
    const additionalPages = await concatenatedPdfDoc.copyPages(
      additionalPdfDoc,
      additionalPdfDoc.getPageIndices()
    );
    additionalPages.forEach((page) => concatenatedPdfDoc.addPage(page));

    // Convert to Buffer for sending in response
    return await concatenatedPdfDoc.save();
  } catch (error) {
    console.error("Error concatenating PDFs:", error);
    throw error;
  }
}

module.exports = { generatePDF };

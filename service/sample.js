const PDFDocument = require("pdfkit");
const axios = require("axios");
const path = require("path");
const { PDFDocument: PDFLibDocument } = require("pdf-lib");

const sharp = require("sharp");
const fs = require("fs").promises;

async function fetchImage(url) {
  try {
    if (!url) throw new Error("Image URL is invalid or empty.");

    const response = await axios.get(url, { responseType: "arraybuffer" });
    if (!response.data || response.data.length === 0) {
      throw new Error("Received empty image buffer.");
    }

    const processedImage = await sharp(response.data)
      .resize(1024)
      .jpeg({ mozjpeg: true })
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error(
      `Error fetching or processing image (${url}):`,
      error.message
    );
    return null;
  }
}

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

    if (imagePath) {
      doc.image(imagePath, 0, 0, {
        width: pageWidth,
        height: pageHeight,
        align: "center",
        valign: "center",
      });
    } else {
      console.error("Background image not available.");
    }

    const logoWidth = 100;

    const logoXPosition = doc.page.width - logoWidth - 10;
    const yPosition = 10;

    doc.image(logoImage, logoXPosition, yPosition, {
      width: logoWidth,
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

    doc.moveDown(1);

    doc.font("Times-Roman").fontSize(12).fillColor("black");

    const paragraphs = [
      "Everyone may don the hat of a traveler, but it's the soulful connection with the destinations, an affection for the mountains, tha truly defines a Traveler.",
      "Nearly a decade ago, BreakBag embarked on a mission to redefine travel, offering a novel approach to exploration. Our vision was simple: to democratize travel, making it accessible to all who dream of traversing the globe,",
      "In an era where communal travel was gaining momentum, our focus remained steadfast: to provide exceptional travel experiences without compromising on affordability.",
      "Specializing in both group departures and tailor-made journeys, BreakBag caters to wanderlust seekers seeking adventures across international and domestic landscapes, including bespoke corporate outings.",
      "At BreakBag, our mission is clear: to deliver unparalleled trvel experiences to our clients. From meticulously selecting the most exceptional accommodations to curating delectable dining options, we spare no effort in ensuring every aspect of your journey exceeds expectations.",
      "Drawing inspiration from out profound love for the beaches to mountains, we seek to impart the invaluable lessons and breathtaking experiences they have bestowed upon us to each and every one of our clients",
    ];

    paragraphs.forEach((para, index) => {
      if (index === 0) {
        doc
          .moveDown(1)
          .font("Times-BoldItalic")
          .fontSize(14)
          .text(`“${para}”`, 70, doc.y, {
            align: "justify",
            width: doc.page.width - 2 * 70,
          });
      } else {
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

    const rectHeight = 50;
    const rectYPosition = doc.page.height - padding - rectHeight - 120;

    const rectMidPoint = doc.page.width / 2;

    doc.rect(0, rectYPosition, rectMidPoint, rectHeight).fill("#053260");

    doc
      .rect(rectMidPoint, rectYPosition, rectMidPoint, rectHeight)
      .fill("#ff9c00");

    doc
      .fontSize(20)
      .fillColor("white")
      .font("Times-Bold")
      .text("OUR RATING", 0, rectYPosition + 15, {
        align: "center",
        width: rectMidPoint,
      });

    doc
      .fontSize(20)
      .fillColor("white")
      .font("Times-Bold")
      .text("RECOGNITION", rectMidPoint, rectYPosition + 15, {
        align: "center",
        width: rectMidPoint,
      });

    // --- Adding the ratings image at the bottom ---
    const ratingsImagePath = path.join(
      __dirname,
      "..",
      "images",
      "ratings.png"
    );
    const imageWidth = 200;
    const imageYPosition = doc.page.height - padding - rectHeight - 30;
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

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    // --- "Brief ITINERARY"  ---
    const briefText = "Brief";
    const itineraryText = " ITINERARY";

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(32);
    const briefTextWidth = doc.widthOfString(briefText);

    doc.font("Times-Bold").fontSize(32);
    const itineraryTextWidth = doc.widthOfString(itineraryText);

    const totalHeadingWidth = briefTextWidth + itineraryTextWidth;
    const headingXPosition = (doc.page.width - totalHeadingWidth) / 2;

    const briefYPosition = 70 - 10;
    const itineraryYPosition = 70;

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
        headingXPosition + briefTextWidth - 70,
        itineraryYPosition
      );

    const lineYPosition = itineraryYPosition + 55;
    doc
      .moveTo(0, lineYPosition)
      .lineTo(doc.page.width + 70, lineYPosition)
      .stroke(); // Render the line

    let startDate = start_Date;

    const totalDays = travelSummaryDemo.length;

    doc
      .moveTo(0, lineYPosition)
      .lineTo(doc.page.width + 70, lineYPosition)
      .stroke();

    const startDate2 = `Start Date : ${startDate}`;
    const endDate = `End Date: ${end_Date}`;
    const destination = `Destination: ${destinationOnly.title}`;
    const travelGuideName = `Travel Guide: ${travelGuide}`;

    doc.font("Times-Roman").fontSize(14).fillColor("black");

    const textYPosition = lineYPosition + 20;

    doc.text(startDate2, padding, textYPosition, { continued: true });

    const spaceBetween = 100;
    doc.text(" ".repeat(spaceBetween / 10), padding, textYPosition, {
      continued: true,
    });

    doc.text(endDate, padding + 153, textYPosition);

    doc.text(destination, padding, doc.y + 10, { continued: true });

    const travelGuideXPosition = padding + 200;
    const travelGuideYPosition = textYPosition + 25;

    doc.text(travelGuideName, travelGuideXPosition, travelGuideYPosition);

    const destinationLineYPosition = doc.y + 15;
    doc
      .moveTo(0, destinationLineYPosition)
      .lineTo(doc.page.width, destinationLineYPosition)
      .stroke();

    const startYPosition = lineYPosition + 120;
    let currentYPosition = startYPosition;

    const dayWidth = 60;

    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    travelSummaryDemo.forEach((summary, index) => {
      const dayText = `Day ${index + 1}`;

      const currentDayDate = addDays(new Date(startDate), index);

      const formattedDate = currentDayDate.toISOString().split("T")[0];

      const rectHeight = 30;
      const rectYPosition = currentYPosition;

      doc
        .fillColor("#053260")
        .rect(padding - 5, rectYPosition, dayWidth, rectHeight)
        .fill();

      const textYPosition = rectYPosition + rectHeight / 2 + 6;

      doc
        .font("Times-Bold")
        .fontSize(18)
        .fillColor("white")
        .text(dayText, padding + 2, textYPosition - 13, {
          width: dayWidth,
          align: "left",
        });

      doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor("black")
        .text(formattedDate, padding - 4, doc.y + 5, {
          width: dayWidth,
          align: "left",
        });

      doc
        .font("Times-Bold")
        .fontSize(16)
        .fillColor("black")
        .text(summary.title, padding + dayWidth + 20, currentYPosition);

      doc
        .font("Times-Roman")
        .fontSize(12)
        .text(summary.description, padding + dayWidth + 20, doc.y + 5, {
          align: "justify",
          width: doc.page.width - padding - (dayWidth + 40),
        });

      const summaryHeight = doc.y - currentYPosition + 5;

      const lineXPosition = padding + dayWidth + 10;
      const lineStartY = currentYPosition;
      const lineEndY = currentYPosition + summaryHeight;
      doc
        .strokeColor("#ff9c00")
        .moveTo(lineXPosition, lineStartY)
        .lineTo(lineXPosition, lineEndY)

        .stroke();

      currentYPosition = doc.y + 20;
    });

    // --- Add Third Page ---
    doc.addPage();

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    const tourText = "TOUR";
    const costText = " Cost";

    doc.font("Times-Bold").fontSize(32);
    const tourTextWidth = doc.widthOfString(tourText);

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const costTextWidth = doc.widthOfString(costText);

    const totalCostHeadingWidth = tourTextWidth + costTextWidth;
    const costHeadingXPosition = (doc.page.width - totalCostHeadingWidth) / 2;

    const tourYPosition = 70;
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(tourText, costHeadingXPosition, tourYPosition, {
        continued: true,
      });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(
        costText,
        costHeadingXPosition + tourTextWidth - 98,
        tourYPosition - 14
      );

    doc.moveDown(0);

    const headerBackgroundColor = "#053260";
    const headerTextColor = "#ffffff";

    const headers = ["User Type", "Price", "Quantity", "Amount"];
    const columnWidths = [150, 130, 100, 150];
    const rowHeight = 40;
    const startX = padding;
    let currentY = doc.y;

    function drawRow(
      y,
      rowHeight,
      colCount = columnWidths.length,
      removeBorders = []
    ) {
      const tableWidth = columnWidths
        .slice(0, colCount)
        .reduce((a, b) => a + b, 0);
      const endX = startX + tableWidth;

      if (!removeBorders.includes("top")) {
        doc.moveTo(startX, y).lineTo(endX, y).stroke();
      }

      columnWidths.slice(0, colCount).reduce((acc, width, index) => {
        if (!removeBorders.includes(`col${index}`)) {
          doc
            .moveTo(acc, y)
            .lineTo(acc, y + rowHeight)
            .stroke();
        }
        return acc + width;
      }, startX);

      if (!removeBorders.includes("right")) {
        doc
          .moveTo(endX, y)
          .lineTo(endX, y + rowHeight)
          .stroke();
      }

      if (!removeBorders.includes("bottom")) {
        doc
          .moveTo(startX, y + rowHeight)
          .lineTo(endX, y + rowHeight)
          .stroke();
      }
    }

    function getVerticalOffset(fontSize, rowHeight) {
      return (rowHeight - fontSize) / 2;
    }

    doc
      .rect(
        startX,
        currentY,
        columnWidths.reduce((a, b) => a + b, 0),
        rowHeight
      )
      .fill(headerBackgroundColor);

    doc.font("Times-Bold").fontSize(14).fillColor(headerTextColor);
    headers.forEach((header, i) => {
      const verticalOffset = getVerticalOffset(14, rowHeight);

      doc.text(
        header,
        startX + columnWidths.slice(0, i).reduce((acc, w) => acc + w, 0),
        currentY + verticalOffset,
        { width: columnWidths[i], align: "center" }
      );
    });

    drawRow(currentY, rowHeight);

    currentY += rowHeight;

    doc.font("Times-Roman").fontSize(12).fillColor("black");

    costData.forEach((row) => {
      drawRow(currentY, rowHeight);

      const verticalOffset = getVerticalOffset(12, rowHeight);

      doc.text(row.userType, startX, currentY + verticalOffset, {
        width: columnWidths[0],
        align: "center",
      });
      doc.text(
        `${row.price.toLocaleString("en-IN")}`,
        startX + columnWidths[0],
        currentY + verticalOffset,
        { width: columnWidths[1], align: "center" }
      );
      doc.text(
        row.quantity,
        startX + columnWidths[0] + columnWidths[1],
        currentY + verticalOffset,
        { width: columnWidths[2], align: "center" }
      );
      doc.text(
        `${row.amount.toLocaleString("en-IN")}`,
        startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
        currentY + verticalOffset,
        { width: columnWidths[3], align: "center" }
      );

      currentY += rowHeight;
    });

    const totalAmount = costData.reduce((total, row) => total + row.amount, 0);

    const totalRowHeight = 40;
    drawRow(currentY, totalRowHeight, 4, ["col1", "col2"]);

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
        }
      );

    doc
      .fillColor("black")
      .text(
        `${totalAmount.toLocaleString("en-IN")}`,
        startX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0),
        currentY + getVerticalOffset(14, totalRowHeight),
        { width: columnWidths[3], align: "center" }
      );

    drawRow(currentY, totalRowHeight, 4, ["col1", "col2", "bottom"]);

    currentY += totalRowHeight;

    const pagePadding = 30;
    const rowHeight1 = 50;
    const rowHeight2 = 40;
    const columnWidths1 = [140, 60, 60, 110, 55, 50, 55];

    const hotelText = "HOTEL";
    const infoText = "Information";

    doc.font("Times-Bold").fontSize(32);
    const hotelTextWidth = doc.widthOfString(hotelText);

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const infoTextWidth = doc.widthOfString(infoText);

    const hotelInfoHeadingWidth = hotelTextWidth + infoTextWidth;
    const InfoXPosition = (doc.page.width - hotelInfoHeadingWidth) / 2;
    const hotelYPosition = 300;

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

    const headers1 = [
      "Hotel Name",
      "Check-In",
      "Check-Out",
      "Location",
      "Meal",
      "Guests",
      "Room",
    ];
    const headerColor = "#FFFFFF";

    const headingHeight = hotelYPosition + 60;
    const tableTop = headingHeight;

    headers1.forEach((header, i) => {
      const x =
        pagePadding + columnWidths1.slice(0, i).reduce((a, b) => a + b, 0);

      doc
        .fillColor(headerBackgroundColor)
        .rect(x, tableTop, columnWidths1[i], rowHeight2)
        .fill();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(headerColor)
        .text(header, x + 5, tableTop + 5, {
          width: columnWidths1[i] - 10,
          align: "center",
        });

      doc.rect(x, tableTop, columnWidths1[i], rowHeight2).stroke();
    });

    // Draw data rows with borders
    doc.font("Helvetica").fontSize(10).fillColor("#000");
    hotelData.forEach((hotel, rowIndex) => {
      const rowY = tableTop + rowHeight2 + rowHeight1 * rowIndex;

      const verticalOffsetY = rowY + rowHeight1 / 2 - 5;

      doc.text(hotel.name, pagePadding, verticalOffsetY, {
        width: columnWidths1[0],
        align: "center",
        baseline: "middle",
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
    for (const item of detailedIteneraryData) {
      doc.addPage();

      doc.image(logoImage, doc.page.width - padding - 100, padding, {
        fit: [100, 100],
      });

      const rectDayHeight = 40;
      const rectDayWidth = 120;
      const rectDayYPosition = doc.page.height - padding - rectDayHeight - 710;

      doc
        .rect(0, rectDayYPosition, rectDayWidth, rectDayHeight)
        .fill("#ff9c00");

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

      const largeImageWidth = doc.page.width * 0.7 - 2 * padding;
      const sidebarWidth = doc.page.width * 0.3 - 2 * padding + 50;
      const adjustedHeight = 230;
      const largeImageHeight = adjustedHeight;
      const sidebarImageHeight = adjustedHeight / 2.1;
      const gap = 10;

      doc
        .rect(padding, currentY, largeImageWidth, largeImageHeight)
        .fillAndStroke("#f0f0f0", "#ccc");

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

      const largeImageUrl = item.images[0];
      const largeImageData = await fetchImage(largeImageUrl);

      if (largeImageData) {
        doc.image(largeImageData, padding, currentY, {
          width: largeImageWidth,
          height: largeImageHeight,
        });
      } else {
        console.error("Background image not available.");
      }

      if (item.images[1]) {
        const sidebarImage1Url = item.images[1];
        const sidebarImage1Data = await fetchImage(sidebarImage1Url);
        if (sidebarImage1Data) {
          doc.image(sidebarImage1Data, sidebarXPosition, currentY, {
            width: sidebarWidth,
            height: sidebarImageHeight,
          });
        } else {
          console.error("Background image not available.");
        }
      }

      if (item.images[2]) {
        const sidebarImage2Url = item.images[2];
        const sidebarImage2Data = await fetchImage(sidebarImage2Url);

        if (sidebarImage2Data) {
          doc.image(
            sidebarImage2Data,
            sidebarXPosition,
            currentY + sidebarImageHeight + gap,
            {
              width: sidebarWidth,
              height: sidebarImageHeight,
            }
          );
        } else {
          console.error("Background image not available.");
        }
      }

      currentY += largeImageHeight + 40;

      doc.font("Times-Bold").fontSize(24).fillColor("#053260");

      const titleHeight = doc.heightOfString(item.title, {
        width: doc.page.width - 2 * padding,
        align: "left",
      });

      doc.text(item.title, padding, currentY, {
        align: "left",
        width: doc.page.width - 2 * padding,
      });
      currentY += titleHeight + 10;

      const maxWidth = doc.page.width - 2 * padding - 20;
      const bulletPointIndent = 35;
      const descriptionIndent = bulletPointIndent + 10;

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

    doc.font("Times-Bold").fontSize(32);
    const TRIPTextWidth = doc.widthOfString(TRIPText);

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const inclusionsTextWidth = doc.widthOfString(inclusionsText);

    const totalinclusionsHeadingWidth = TRIPTextWidth + inclusionsTextWidth;

    const inclusionsHeadingXPosition = 0;

    const TRIPYPosition = 70;
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(TRIPText, inclusionsHeadingXPosition + 30, TRIPYPosition, {
        continued: true,
      });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(
        inclusionsText,
        inclusionsHeadingXPosition + TRIPTextWidth - 54,
        TRIPYPosition - 15
      );

    const inclusionsLineYPosition = TRIPYPosition + 35;

    const lineLengthIncrease = 50;
    doc
      .moveTo(inclusionsHeadingXPosition - 25, inclusionsLineYPosition)
      .lineTo(
        inclusionsHeadingXPosition + totalinclusionsHeadingWidth + 25,
        inclusionsLineYPosition
      )
      .lineWidth(1)
      .strokeColor("#000000")
      .stroke();

    let inclusionY = 120;

    for (let i = 0; i < inclusionData.itemList.length; i++) {
      const item = inclusionData.itemList[i];

      const titleColor = i % 2 === 0 ? "#053260" : "#ff9c00";

      doc
        .font("Times-Bold")
        .fontSize(24)
        .fillColor(titleColor)
        .text(`${item.title} :`, padding + 7, inclusionY, {
          align: "left",
        });

      inclusionY = doc.y + 10;

      item.description.forEach((desc) => {
        doc
          .font("Times-Roman")
          .fontSize(14)
          .fillColor("#000000")
          .text(`• ${desc}`, padding + 27, inclusionY, {
            align: "left",
            width: doc.page.width - 2 * padding,
          });

        inclusionY = doc.y + 5;
      });

      inclusionY += 10;
    }

    // -----------------------------Transfers---------------------------

    doc.addPage();

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    const TRANSFERSText = "TRANSFER";
    doc.font("Times-Bold").fontSize(32);
    const TRANSFERSTextWidth = doc.widthOfString(TRANSFERSText);

    const transfersProcessText = "Information";
    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const transfersProcessTextWidth = doc.widthOfString(transfersProcessText);

    const totalTransfersHeadingWidth =
      TRANSFERSTextWidth + transfersProcessTextWidth;

    const transfersHeadingXPosition = 0;

    const TRANSFERSYPosition = 70;

    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(TRANSFERSText, transfersHeadingXPosition + 30, TRANSFERSYPosition, {
        continued: true,
      });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(
        transfersProcessText,
        transfersHeadingXPosition + TRANSFERSTextWidth - 140,
        TRANSFERSYPosition - 15
      );

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

    let bulletPointYPositionForTransfers = transfersLineYPosition + 35;

    const maxWidthForTransfers = 500;

    transfersProcessData.forEach((item) => {
      const bulletPoint = "• ";

      doc.font("Times-Roman").fontSize(14).fillColor("#000000");

      // Print the bullet point first
      doc.text(bulletPoint, 35, bulletPointYPositionForTransfers);

      doc.text(item, 45, bulletPointYPositionForTransfers, {
        width: maxWidthForTransfers,
        lineGap: 5,
      });

      const itemHeight = doc.heightOfString(item, {
        width: maxWidthForTransfers,
      });

      bulletPointYPositionForTransfers += itemHeight + 19;
    });

    // ------------------------Exclusions----------------------------
    doc.addPage();

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    const exclusionsText = " Exclusions";

    doc.font("Times-Bold").fontSize(32);

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const exclusionsTextWidth = doc.widthOfString(exclusionsText);

    const totalexclusionsHeadingWidth = TRIPTextWidth + exclusionsTextWidth;

    const exclusionsHeadingXPosition = 0;

    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(TRIPText, exclusionsHeadingXPosition + 30, TRIPYPosition, {
        continued: true,
      });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(
        exclusionsText,
        exclusionsHeadingXPosition + TRIPTextWidth - 54,
        TRIPYPosition - 15
      );

    const exclusionsLineYPosition = TRIPYPosition + 35;

    doc
      .moveTo(exclusionsHeadingXPosition - 25, exclusionsLineYPosition)
      .lineTo(
        exclusionsHeadingXPosition + totalexclusionsHeadingWidth + 25,
        exclusionsLineYPosition
      )
      .lineWidth(1)
      .strokeColor("#000000")
      .stroke();

    let bulletPointYPosition = inclusionsLineYPosition + 35;

    const maxWidth = 500;

    exclusionsData.forEach((item) => {
      const bulletPoint = "• ";

      doc.font("Times-Roman").fontSize(14).fillColor("#black");

      doc.text(bulletPoint, 35, bulletPointYPosition);

      doc.text(item, 45, bulletPointYPosition, {
        width: maxWidth,
        lineGap: 5,
      });

      const itemHeight = doc.heightOfString(item, { width: maxWidth });

      bulletPointYPosition += itemHeight + 19;
    });

    doc.addPage();

    doc.image(logoImage, doc.page.width - padding - 100, padding, {
      fit: [100, 100],
    });

    const OTHERText = "OTHER";
    const informationText = "Information";

    doc.font("Times-Bold").fontSize(32);
    const OTHERTextWidth = doc.widthOfString(OTHERText);

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40);
    const informationTextWidth = doc.widthOfString(informationText);

    const totalinformationHeadingWidth = OTHERTextWidth + informationTextWidth;

    const informationHeadingXPosition = 0;

    const OTHERYPosition = 70;
    doc
      .font("Times-Bold")
      .fontSize(32)
      .fillColor("#053260")
      .text(OTHERText, informationHeadingXPosition + 30, OTHERYPosition, {
        continued: true,
      });

    doc
      .font(path.join(__dirname, "..", "fonts", "Sacramento-Regular.ttf"))
      .fontSize(40)
      .fillColor("#ff9c00")
      .text(
        informationText,
        informationHeadingXPosition + OTHERTextWidth - 75,
        OTHERYPosition - 15
      );

    const informationLineYPosition = OTHERYPosition + 35;

    doc
      .moveTo(informationHeadingXPosition - 40, informationLineYPosition)
      .lineTo(
        informationHeadingXPosition + totalinformationHeadingWidth + 40,
        informationLineYPosition
      )
      .lineWidth(1)
      .strokeColor("#000000")
      .stroke();

    // -------------------Other info ---------------------

    let bulletPointYPositionForOtherInfo = informationLineYPosition + 35;

    const maxWidthForOtherInfo = 500;

    otherInfoData.forEach((item) => {
      const bulletPoint = "• ";

      doc.font("Times-Roman").fontSize(14).fillColor("#000000");

      doc.text(bulletPoint, 35, bulletPointYPositionForOtherInfo);

      doc.text(item, 45, bulletPointYPositionForOtherInfo, {
        width: maxWidthForOtherInfo,
        lineGap: 5,
      });

      const itemHeight = doc.heightOfString(item, {
        width: maxWidthForOtherInfo,
      });

      bulletPointYPositionForOtherInfo += itemHeight + 19;
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

// Concatenate PDFs
async function concatenatePDFs(generatedPdfBuffer) {
  try {
    const generatedPdfDoc = await PDFLibDocument.load(generatedPdfBuffer);

    const additionalPdfPath = path.join(__dirname, "Pdf.pdf");

    try {
      await fs.access(additionalPdfPath);
    } catch (err) {
      return generatedPdfBuffer;
    }

    const additionalPdfBytes = await fs.readFile(additionalPdfPath);
    const additionalPdfDoc = await PDFLibDocument.load(additionalPdfBytes);

    const concatenatedPdfDoc = await PDFLibDocument.create();

    const generatedPages = await concatenatedPdfDoc.copyPages(
      generatedPdfDoc,
      generatedPdfDoc.getPageIndices()
    );
    const additionalPages = await concatenatedPdfDoc.copyPages(
      additionalPdfDoc,
      additionalPdfDoc.getPageIndices()
    );

    generatedPages.forEach((page) => concatenatedPdfDoc.addPage(page));
    additionalPages.forEach((page) => concatenatedPdfDoc.addPage(page));

    return await concatenatedPdfDoc.save();
  } catch (error) {
    console.error("Error concatenating PDFs:", error.message);
    throw new Error("Error concatenating PDFs: " + error.message);
  }
}

module.exports = { generatePDF };

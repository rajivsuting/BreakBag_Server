const express = require("express");
const router = express.Router();
const otherInformationController = require("../controllers/otherInformationController");
const { protect, restrictTo } = require("../middleware/authMiddleware"); // Assuming JWT middleware for authentication

// Route to create a new other information record
router.post(
  "/other-information/create",
  //   protect, // Protect the route to ensure only authenticated users can access
  //   restrictTo("admin"), // Restrict this route to admin users only
  otherInformationController.createOtherInformation
);

// Route to get all other information records
router.get(
  "/other-information",
  //   protect, // Protect the route to ensure only authenticated users can access
  otherInformationController.getAllOtherInformation
);

router.get(
  "/search",
  otherInformationController.searchOtherInformationByKeyword
);

module.exports = router;

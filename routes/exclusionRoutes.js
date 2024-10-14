const express = require("express");
const router = express.Router();
const exclusionController = require("../controllers/exclusionController");
const { protect, restrictTo } = require("../middleware/authMiddleware"); // Assuming JWT middleware for protecting routes

// Route to create a new exclusion
router.post(
  "/exclusions/create",
  //   protect, // Protect the route to ensure only authenticated users can access
  //   restrictTo("admin"), // Restrict this route to admin users only
  exclusionController.createExclusion
);

// Route to get all exclusions
router.get(
  "/exclusions",
  //   protect, // Protect the route to ensure only authenticated users can access
  exclusionController.getAllExclusions
);

router.get("/search", exclusionController.searchExclusionsByKeyword);

module.exports = router;

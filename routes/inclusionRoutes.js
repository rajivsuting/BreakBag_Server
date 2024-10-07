const express = require("express");
const router = express.Router();
const inclusionController = require("../controllers/inclusionController");
const upload = require("../config/multerConfig"); // Assuming you are using a multer config for file uploads
const { protect, restrictTo } = require("../middleware/authMiddleware"); // Assuming JWT middleware for protecting routes

// Route to create a new inclusion
router.post(
  "/inclusions/create",
  //   protect, // Protect the route to ensure only authenticated users can access
  //   restrictTo("admin"), // Restrict this route to admin users only
  upload.array("images", 5), // Upload up to 5 images with the field name 'images'
  inclusionController.createInclusion
);

// Route to get all inclusions
router.get(
  "/inclusions",
  //   protect, // Protect the route to ensure only authenticated users can access
  inclusionController.getAllInclusions
);

router.get(
  "/destination/:destination",
  inclusionController.getInclusionByDestination
);
module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig"); // Multer config for handling file uploads
const {
  createActivity,
  getAllActivity,
  searchActivityByKeyword,
} = require("../controllers/activityController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post(
  "/create",

  upload.array("images", 5), // Handle multiple image uploads (up to 5 images)
  createActivity // Call the controller function to create an activity
);

// Route to get all activities (accessible to everyone)
router.get("/all", getAllActivity);

router.get("/search", searchActivityByKeyword);

module.exports = router;

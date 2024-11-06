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
  inclusionController.createInclusion
);

// Route to get all inclusions
router.get(
  "/inclusions",
  //   protect, // Protect the route to ensure only authenticated users can access
  inclusionController.getAllInclusions
);

router.get("/search", inclusionController.searchInclusionsByKeyword);

router.put("/edit/:id", inclusionController.editInclusion);
router.delete("/delete/:id", inclusionController.deleteInclusion);
module.exports = router;

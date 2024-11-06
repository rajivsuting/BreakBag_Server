const express = require("express");
const router = express.Router();
const transferController = require("../controllers/transferController");
const { protect, restrictTo } = require("../middleware/authMiddleware"); // Assuming JWT middleware for protecting routes

// Route to create a new transfer
router.post(
  "/transfers/create",
  //   protect, // Protect the route to ensure only authenticated users can access
  //   restrictTo("admin"), // Restrict this route to admin users only
  transferController.createTransfer
);

// Route to get all transfers
router.get(
  "/transfers",
  //   protect, // Protect the route to ensure only authenticated users can access
  transferController.getAllTransfers
);

router.get("/search", transferController.searchTransfersByKeyword);

router.put("/edit/:id", transferController.editTransfer);

module.exports = router;

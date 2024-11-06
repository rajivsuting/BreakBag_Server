const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  searchDestinationByTitle,
  editDestination,
} = require("../controllers/destinationController");
const upload = require("../config/multerConfig");

router.post("/create", upload.single("image"), createDestination);
router.get("/destinaions", getAllDestinations);
router.get("/search", searchDestinationByTitle);
router.put("/edit/:id", upload.single("image"), editDestination);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  searchDestinationByTitle,
  editDestination,
  deleteDestination,
} = require("../controllers/destinationController");
const upload = require("../config/multerConfig");

router.post("/create", upload.single("image"), createDestination);
router.get("/destinaions", getAllDestinations);
router.get("/search", searchDestinationByTitle);
router.put("/edit/:id", upload.single("image"), editDestination);
router.delete("/delete/:id", deleteDestination);

module.exports = router;
// http://139.59.89.255:8080/api/destination/destinaions
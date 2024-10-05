const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
} = require("../controllers/destinationController");
const upload = require("../config/multerConfig");

router.post("/create", upload.single("image"), createDestination);
router.get("/destinaions", getAllDestinations);

module.exports = router;

const express = require("express");
const router = express.Router();
const { createDestination } = require("../controllers/destinationController");
const upload = require("../config/multerConfig");

router.post("/create", upload.single("image"), createDestination);

module.exports = router;

const express = require("express");
const router = express.Router();
const travellerController = require("../controllers/travellerController");

// Create a new Traveller
router.post("/create", travellerController.createTraveller);

// Get all Travellers with Pagination and Search
router.get("/all", travellerController.getTravellers);

// Get a Traveller by ID
router.get("/:id", travellerController.getTravellerById);

// Update a Traveller by ID
router.put("/edit/:id", travellerController.updateTraveller);

// Delete a Traveller by ID
router.delete("/delete/:id", travellerController.deleteTraveller);

module.exports = router;

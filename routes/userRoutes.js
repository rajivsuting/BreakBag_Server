const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // Adjust the path to the userController

// Create a new agent
router.post("/create", userController.createUser);

// Get all agents
router.get("/all", userController.getAllAgents);

// Edit agent details
router.put("/edit/:id", userController.editAgent);

// Delete an agent
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;

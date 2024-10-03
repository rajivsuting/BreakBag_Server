const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController"); // Adjust the path to the agentController

// Create a new agent
router.post("/create", agentController.createAgent);

// Get all agents
router.get("/all", agentController.getAllAgents);

// Edit agent details
router.put("/edit/:id", agentController.editAgent);

// Delete an agent
router.delete("/delete/:id", agentController.deleteAgent);

module.exports = router;

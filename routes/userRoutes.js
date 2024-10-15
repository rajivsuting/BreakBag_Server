const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // Adjust the path to the userController
const { restrictTo, protect } = require("../middleware/authMiddleware");

// Create a new agent
router.post("/create", userController.createUser);

// Get all agents
router.get("/all", userController.getAllAgentsOrTeamleads);

// Edit agent details
router.put("/edit/:id", userController.editAgent);

// Delete an agent
router.delete("/delete/:id", userController.deleteUser);

router.get(
  "/team-lead/:teamLeadId/agents",
  protect,
  restrictTo("Team Lead"),
  userController.getAgentsUnderTeamLead
);

router.post(
  "/team-lead/:teamLeadId/assign-agents",
  userController.assignAgentsToTeamLead
);

module.exports = router;

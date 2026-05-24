const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// Route: Get all agents
// GET /api/agents
router.get('/', agentController.getAgents);

// Route: Create new agent
// POST /api/agents
router.post('/', agentController.createAgent);

// Route: Update an agent
// PUT /api/agents/:id
router.put('/:id', agentController.updateAgent);

// Route: Delete an agent
// DELETE /api/agents/:id
router.delete('/:id', agentController.deleteAgent);

module.exports = router;

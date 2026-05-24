const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route: Register User
// POST /api/auth/register
router.post('/register', authController.register);

// Route: Login User
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;

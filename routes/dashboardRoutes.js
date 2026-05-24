const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Route: Get dashboard stats
// GET /api/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats);

// Route: Get user specific bookings
// GET /api/dashboard/my-bookings
router.get('/my-bookings', dashboardController.getUserBookings);

module.exports = router;

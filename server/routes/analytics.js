const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAnalytics, getGuiltySpending } = require('../controllers/analyticsController');

// @route   GET /api/analytics
// @desc    Get analytics data
// @access  Private
router.get('/', protect, getAnalytics);

// @route   GET /api/analytics/guilty
// @desc    Get guilty spending warnings
// @access  Private
router.get('/guilty', protect, getGuiltySpending);

module.exports = router;

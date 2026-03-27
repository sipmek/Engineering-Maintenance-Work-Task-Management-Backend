const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/stats', protect, getStats);

module.exports = router;

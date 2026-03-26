const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { createTask ,getTaskDetail,createActivity} = require('../controllers/taskController');

// semua role boleh create task
router.post('/', protect, createTask);

// semua role boleh melihat detail task
router.get('/:id', protect, getTaskDetail);
router.post('/:taskId/activities', protect, createActivity);

module.exports = router;
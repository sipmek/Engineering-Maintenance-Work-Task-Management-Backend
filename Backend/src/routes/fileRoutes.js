const express = require('express');
const path = require('path');

const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { checkTaskAccess } = require('../middlewares/taskAccessMiddleware');
const { TaskActivity } = require('../models');

router.get('/:filename', protect, async (req, res, next) => {
  try {
    const { filename } = req.params;

    // 🔍 cari activity berdasarkan file
    const activity = await TaskActivity.findOne({
      where: {
        file_url: `/uploads/${filename}`,
      },
    });

    if (!activity) {
      return res.status(404).json({
        status: 'fail',
        message: 'File tidak ditemukan!',
      });
    }

    // inject taskId ke req biar reuse middleware
    req.params.taskId = activity.task_id;

    // 🔐 cek akses task
    checkTaskAccess(req, res, () => {
      const filePath = path.join(__dirname, '../../uploads', filename);
      res.sendFile(filePath);
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
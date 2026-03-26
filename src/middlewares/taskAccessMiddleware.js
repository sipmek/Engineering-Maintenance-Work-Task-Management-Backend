const { Task, TaskMember } = require('../models');

const checkTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.taskId || req.params.id;
    const user = req.user;

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task tidak ditemukan!',
      });
    }

    // 👑 emperor & admin bebas akses
    if (user.role === 'emperor' || user.role === 'admin') {
      return next();
    }

    // 👤 creator
    if (task.created_by === user.id) {
      return next();
    }

    // 👤 assigned user
    if (task.assigned_to === user.id) {
      return next();
    }

    // 👥 cek member
    const isMember = await TaskMember.findOne({
      where: {
        task_id: taskId,
        user_id: user.id,
      },
    });

    if (isMember) {
      return next();
    }

    return res.status(403).json({
      status: 'fail',
      message: 'Anda tidak memiliki akses ke task ini!',
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkTaskAccess,
};
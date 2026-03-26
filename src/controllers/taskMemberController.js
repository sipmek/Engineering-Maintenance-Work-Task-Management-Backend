
const { Task, TaskMember, User } = require('../models');

const addMember = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { user_id } = req.body;

    const currentUser = req.user;

    // 🔍 cek task
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task tidak ditemukan!',
      });
    }

    // 🔐 hanya creator / admin / emperor
    if (
      currentUser.role !== 'emperor' &&
      currentUser.role !== 'admin' &&
      task.created_by !== currentUser.id
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'Tidak punya akses menambahkan member!',
      });
    }

    // 🔍 cek user
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan!',
      });
    }

    // ❌ jangan duplicate
    const existing = await TaskMember.findOne({
      where: { task_id: taskId, user_id }
    });

    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: 'User sudah menjadi member!',
      });
    }

    // 🧱 create member
    const member = await TaskMember.create({
      task_id: taskId,
      user_id
    });

    res.status(201).json({
      status: 'success',
      data: member,
      message: 'Member berhasil ditambahkan!',
    });

  } catch (err) {
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const members = await TaskMember.findAll({
      where: { task_id: taskId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'role']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: members
    });

  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { taskId, userId } = req.params;
    const currentUser = req.user;

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task tidak ditemukan!',
      });
    }

    // 🔐 hanya creator/admin/emperor
    if (
      currentUser.role !== 'emperor' &&
      currentUser.role !== 'admin' &&
      task.created_by !== currentUser.id
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'Tidak punya akses menghapus member!',
      });
    }

    const member = await TaskMember.findOne({
      where: {
        task_id: taskId,
        user_id: userId
      }
    });

    if (!member) {
      return res.status(404).json({
        status: 'fail',
        message: 'Member tidak ditemukan!',
      });
    }

    await member.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Member berhasil dihapus!'
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  addMember,
  getMembers,
  removeMember
};
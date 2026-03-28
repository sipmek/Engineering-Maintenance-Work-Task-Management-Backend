const { TaskMember, User, TaskActivity } = require('../models');
const sendResponse = require('../utils/response');

/**
 * 👥 Add Member to Task
 */
const addMember = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { user_id } = req.body;

    // ❌ Cek apakah sudah ada
    const existing = await TaskMember.findOne({ where: { task_id: taskId, user_id } });
    if (existing) {
      return sendResponse(res, 400, 'fail', 'User sudah terdaftar sebagai member di task ini!');
    }

    // 🧱 Buat member baru
    const member = await TaskMember.create({ task_id: taskId, user_id });
    
    // 📝 Log activity
    const userAsigned = await User.findByPk(user_id);
    await TaskActivity.create({
      task_id: taskId,
      user_id: req.user.id,
      type: 'system',
      message: `System: ${userAsigned?.username || 'User'} ditambahkan ke dalam task oleh ${req.user.username}`
    });

    return sendResponse(res, 201, 'success', 'Member berhasil ditambahkan!', member);
  } catch (err) {
    next(err);
  }
};

/**
 * ❌ Remove Member from Task
 */
const removeMember = async (req, res, next) => {
  try {
    const { taskId, userId } = req.params;

    const member = await TaskMember.findOne({ where: { task_id: taskId, user_id: userId } });
    if (!member) {
      return sendResponse(res, 404, 'fail', 'Member tidak ditemukan!');
    }

    // 🔍 Ambil user info buat log message sebelum hapus
    const userRemoved = await User.findByPk(userId);

    // 📝 Log activity
    await TaskActivity.create({
      task_id: taskId,
      user_id: req.user.id,
      type: 'system',
      message: `System: ${userRemoved?.username || 'User'} dihapus dari task oleh ${req.user.username}`
    });

    await member.destroy();
    return sendResponse(res, 200, 'success', 'Member berhasil dihapus!');
  } catch (err) {
    next(err);
  }
};

/**
 * 📋 Get Task Members
 */
const getMembers = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const members = await TaskMember.findAll({
      where: { task_id: taskId },
      include: [{ model: User, attributes: ['id', 'username', 'photo', 'role'] }]
    });

    return sendResponse(res, 200, 'success', 'Data member berhasil diambil!', members);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addMember,
  removeMember,
  getMembers
};
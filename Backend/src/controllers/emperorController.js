const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const sendResponse = require('../utils/response');

// 👑 CREATE USER (hanya emperor)
const createUser = async (req, res, next) => {
  try {
    let { username, email, password, role } = req.body;

    // 🧹 sanitize
    username = username?.trim();
    email = email?.trim();

    if (!username || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Username dan password wajib diisi!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password minimal 6 karakter!",
      });
    }

    // 🔒 role protection
    const allowedRoles = ["admin", "user"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "fail",
        message: "Role tidak valid!",
      });
    }

    // 📧 email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Format email tidak valid!",
      });
    }

    // 🔍 duplicate check
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "Username atau email sudah digunakan!",
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      status: "active",
    });

    return sendResponse(res, 201, "success", "User berhasil dibuat!", {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role", "status", "photo"],
    });

    return sendResponse(res, 200, "success", "Data user berhasil diambil!", users);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, role, status } = req.body;

    // 🔍 cari user target
    const user = await User.findByPk(id);
    if (!username && !email && !role && !status) {
      return res.status(400).json({
        status: "fail",
        message: "Tidak ada data yang diupdate!",
      });
    }
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User tidak ditemukan!",
      });
    }

    // ❌ tidak boleh ubah emperor
    if (user.role === "emperor") {
      return res.status(403).json({
        status: "fail",
        message: "Tidak bisa mengubah akun emperor!",
      });
    }

    // ❌ tidak boleh ubah diri sendiri
    if (user.id === req.user.id) {
      return res.status(400).json({
        status: "fail",
        message: "Tidak bisa mengubah akun sendiri!",
      });
    }

    // 🔒 validasi role
    const allowedRoles = ["admin", "user"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "fail",
        message: "Role tidak valid!",
      });
    }

    // 🔒 validasi email duplicate jika berubah
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ status: 'fail', message: 'Email sudah digunakan!' });
      }
    }

    // 🔒 validasi username duplicate jika berubah
    if (username && username !== user.username) {
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return res.status(400).json({ status: 'fail', message: 'Username sudah digunakan!' });
      }
    }

    // 🔒 validasi status
    const allowedStatus = ["active", "banned"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Status tidak valid!",
      });
    }

    // ✏️ update data
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    return sendResponse(res, 200, "success", "User berhasil diupdate!", {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};

const banUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan!',
      });
    }

    // ❌ tidak boleh ban emperor
    if (user.role === 'emperor') {
      return res.status(403).json({
        status: 'fail',
        message: 'Tidak bisa membanned emperor!',
      });
    }

    // ❌ tidak boleh ban diri sendiri
    if (user.id === req.user.id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tidak bisa membanned diri sendiri!',
      });
    }

    user.status = 'banned';
    await user.save();

    return sendResponse(res, 200, 'success', 'User berhasil dibanned!');

  } catch (err) {
    next(err);
  }
};


const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan!',
      });
    }

    user.status = 'active';
    await user.save();

    return sendResponse(res, 200, 'success', 'User berhasil diaktifkan kembali!');

  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password minimal 6 karakter!',
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan!',
      });
    }

    // ❌ tidak boleh reset emperor (opsional tapi recommended)
    if (user.role === 'emperor') {
      return res.status(403).json({
        status: 'fail',
        message: 'Tidak bisa reset password emperor!',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return sendResponse(res, 200, 'success', 'Password berhasil direset!');

  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch(e) { console.error('Unlink failed:', e); }
      }
      return res.status(404).json({ status: 'fail', message: 'User tidak ditemukan!' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'File foto tidak ditemukan!' });
    }

    // hapus foto lama jika ada
    if (user.photo) {
      const oldPath = path.join(__dirname, '../../', user.photo);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch(e) { console.error('Old photo unlink failed:', e); }
      }
    }

    user.photo = `uploads/${req.file.filename}`;
    await user.save();

    return sendResponse(res, 200, 'success', 'Avatar berhasil diupload!', { photo: user.photo });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    if (req.file) {
       try { fs.unlinkSync(req.file.path); } catch(e) { console.error('Error catch unlink failed:', e); }
    }
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal Server Error during upload'
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  banUser,
  activateUser,
  resetPassword,
  uploadAvatar
};

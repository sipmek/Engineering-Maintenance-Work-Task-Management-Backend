const bcrypt = require('bcryptjs');
const { User } = require('../models');

// 🔐 REGISTER
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 🧪 VALIDASI DASAR
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Semua field wajib diisi!',
      });
    }

    if (!email.includes('@')) {
  return res.status(400).json({
    status: 'fail',
    message: 'Format email tidak valid!',
  });
}

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password minimal 6 karakter!',
      });
    }

    // 🔍 CEK DUPLIKAT
    const existingUser = await User.findOne({
      where: {
        username,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username sudah digunakan!',
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 SIMPAN USER
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',      // ❗ dipaksa
      status: 'pending', // ❗ menunggu approval
    });

    const sendResponse = require('../utils/response');
    return sendResponse(res, 201, 'success', 'Registrasi berhasil, menunggu persetujuan!', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
};
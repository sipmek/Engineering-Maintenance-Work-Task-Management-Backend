const bcrypt = require('bcryptjs');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const sendResponse = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 🧪 VALIDASI
    if (!username || !password) {
      return sendResponse(res, 400, 'fail', 'Username dan password wajib diisi!');
    }

    // 🔍 CARI USER
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return sendResponse(res, 401, 'fail', 'Username atau password salah!');
    }

    // 🔐 CEK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendResponse(res, 401, 'fail', 'Username atau password salah!');
    }

    // 🚫 CEK STATUS
    if (user.status !== 'active') {
      return sendResponse(res, 403, 'fail', 'Akun tidak aktif!');
    }

    // 🎟️ TOKEN
    const token = generateToken(user);

    return sendResponse(res, 200, 'success', 'Login berhasil!', {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
};
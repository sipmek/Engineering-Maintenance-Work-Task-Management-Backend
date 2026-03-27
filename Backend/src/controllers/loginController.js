const bcrypt = require('bcryptjs');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 🧪 VALIDASI
    if (!username || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username dan password wajib diisi!',
      });
    }

    // 🔍 CARI USER
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Username atau password salah!',
      });
    }

    // 🔐 CEK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Username atau password salah!',
      });
    }

    // 🚫 CEK STATUS
    if (user.status !== 'active') {
      return res.status(403).json({
        status: 'fail',
        message: 'Akun tidak aktif!',
      });
    }

    // 🎟️ TOKEN
    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      message: 'Login berhasil!',
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
};
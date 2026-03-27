const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;

    // 📥 Ambil token dari header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Tidak ada token, akses ditolak!',
      });
    }

    // 🔐 Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Ambil user dari DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User tidak ditemukan!',
      });
    }

    req.user = user; // 🔥 inject ke request
    next();

    

  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid!',
    });
  }
};


const authorize = (...roles) => {
      return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({
            status: 'fail',
            message: 'Anda tidak memiliki akses!',
          });
        }
        next();
      };
    };

module.exports = {
  protect,authorize
};
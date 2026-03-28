const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');


const app = express();
// 🔐 Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 🌐 CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 🧠 Parsing JSON
app.use(express.json());

// Serve Static Files (Uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 📊 Logging
app.use(morgan('dev'));

// 🚫 Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200, // Tingkatkan sedikit untuk penggunaan normal
  message: {
    status: 'fail',
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter); // Hanya batasi /api, bukan statis

// 🔐 Login Specific Limiter (Brute Force Protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: process.env.RATE_LIMIT_LOGIN_MAX || 5, // Default 5 percobaan
  message: {
    status: 'fail',
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('loginLimiter', loginLimiter);


// ✅ Test route
app.get('/', (req, res) => {
  res.json({ message: 'API berjalan 🚀' });
 });

const authRoutes = require('./routes/authRoutes');
const emperorRoutes = require('./routes/emperorRoutes');
const taskRoutes = require('./routes/taskRoutes');
const fileRoutes = require('./routes/fileRoutes');
const budgetRequestRoutes = require('./routes/budgetRequestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');



// Routes
app.use('/api', budgetRequestRoutes);
app.use('/files', fileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/emperor', emperorRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 🔍 404 Handler (URL tidak ditemukan)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Endpoint ${req.originalUrl} tidak ditemukan di server ini.`
  });
});

// 🚨 Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message: err.message || 'Terjadi kesalahan pada server.'
  });
});

module.exports = app;
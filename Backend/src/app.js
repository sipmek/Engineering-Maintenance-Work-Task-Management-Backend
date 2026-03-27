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
  origin: 'http://localhost:5173', // nanti ganti domain frontend
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
  max: 100
});
app.use(limiter);


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

// 🚨 Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
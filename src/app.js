const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');


const app = express();
// 🔐 Security
app.use(helmet());

// 🌐 CORS
app.use(cors({
  origin: 'http://localhost:5173', // nanti ganti domain frontend
  credentials: true
}));

// 🧠 Parsing JSON
app.use(express.json());

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

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/emperor', emperorRoutes);

module.exports = app;
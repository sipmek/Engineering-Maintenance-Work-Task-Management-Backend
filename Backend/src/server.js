require('dotenv').config();

const app = require('./app');
// Koneksi ke database
const { connectDB, sequelize } = require('./config/database');
require('./models'); // pastikan model ter-load
const seedEmperor = require('./utils/seedEmperor');

const PORT = process.env.PORT || 5000;


connectDB().then(async () => {
  try {
    await sequelize.sync(); // stable sync (no alter/force)
    console.log('[DB] Sync berhasil...');
    await seedEmperor(); // 🔥 ini penting

    const server = app.listen(PORT, () => {
      console.log(`[INFO] Server berjalan di mode ${process.env.NODE_ENV || 'development'}`);
      console.log(`[INFO] Dapat diakses di http://localhost:${PORT}`);
    });

    process.on('unhandledRejection', (err, promise) => {
      console.log(`[FATAL ERROR] Terjadi Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error('[DB SYNC ERROR]', err.message);
  }
});
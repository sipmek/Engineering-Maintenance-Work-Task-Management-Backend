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

    // 🛑 Graceful Shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n[SHUTDOWN] Menerima sinyal ${signal}. Menutup server...`);
      server.close(async () => {
        console.log('[SHUTDOWN] Server ditutup.');
        try {
          await sequelize.close();
          console.log('[SHUTDOWN] Koneksi database ditutup.');
        } catch (err) {
          console.error('[SHUTDOWN ERROR]', err.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    process.on('unhandledRejection', (err) => {
      console.log(`[FATAL ERROR] Unhandled Rejection: ${err.message}`);
      gracefulShutdown('Unhandled Rejection');
    });

  } catch (err) {
    console.error('[DB SYNC ERROR]', err.message);
  }
});
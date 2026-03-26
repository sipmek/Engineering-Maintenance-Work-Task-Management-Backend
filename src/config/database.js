const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // nanti bisa true kalau mau debug
  }
);

// Test koneksi
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] MySQL connected...');
  } catch (error) {
    console.error('[DB ERROR]', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
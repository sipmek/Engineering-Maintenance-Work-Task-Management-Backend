const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },

  photo: {
    type: DataTypes.STRING, // simpan URL atau path file
    allowNull: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM('user', 'admin' , 'emperor'),
    defaultValue: 'user',
  },

  status: {
    type: DataTypes.ENUM('pending', 'active', 'banned'),
    defaultValue: 'pending',
  }

}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
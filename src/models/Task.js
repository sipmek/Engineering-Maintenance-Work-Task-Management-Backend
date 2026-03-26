const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  category: {
    type: DataTypes.ENUM(
      'teknik',
      'it',
      'engineering',
      'teknologi',
      'lossprevention',
      'infrastruktur'
    ),
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM('ongoing', 'hold', 'done'),
    defaultValue: 'ongoing',
  },

  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },

  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'tasks',
  timestamps: true,
});

module.exports = Task;
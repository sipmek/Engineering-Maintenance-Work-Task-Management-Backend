const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskActivity = sequelize.define('TaskActivity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM(
      'comment',
      'progress',
      'budget_request',
      'budget_approved',
      'budget_rejected',
      'status_update',
      'attachment',
      'system'
    ),
    allowNull: false,
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },

  status_update: {
    type: DataTypes.ENUM('ongoing', 'hold', 'done'),
    allowNull: true,
  },

  file_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  file_type: {
  type: DataTypes.ENUM('image', 'document'),
  allowNull: true,
}

}, {
  tableName: 'task_activities',
  timestamps: true,
});

module.exports = TaskActivity;
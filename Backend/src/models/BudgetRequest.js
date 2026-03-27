const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BudgetRequest = sequelize.define('BudgetRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  actual_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  receipt_photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'budget_requests',
  timestamps: true,
  underscored: true,
});

module.exports = BudgetRequest;
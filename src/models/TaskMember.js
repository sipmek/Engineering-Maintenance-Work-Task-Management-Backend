const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskMember = sequelize.define('TaskMember', {
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

}, {
  tableName: 'task_members',
  timestamps: true,
});

module.exports = TaskMember;
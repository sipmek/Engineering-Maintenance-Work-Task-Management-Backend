const User = require('./User');
const Task = require('./Task');
const TaskActivity = require('./TaskActivity');
const TaskMember = require('./TaskMember');
const BudgetRequest = require('./BudgetRequest');

// 🔗 Task → User
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// 🔗 TaskActivity
TaskActivity.belongsTo(Task, { foreignKey: 'task_id' });
TaskActivity.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(TaskActivity, { foreignKey: 'task_id' });

// 🔗 TaskMember
TaskMember.belongsTo(Task, { foreignKey: 'task_id' });
TaskMember.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(TaskMember, { foreignKey: 'task_id' });

BudgetRequest.belongsTo(Task, { foreignKey: 'task_id' })
BudgetRequest.belongsTo(User, { as: 'requester', foreignKey: 'requested_by' })
BudgetRequest.belongsTo(User, { as: 'approver', foreignKey: 'approved_by' })
Task.hasMany(BudgetRequest, { foreignKey: 'task_id' });

module.exports = {
  User,
  Task,
  TaskActivity,
  TaskMember,
  BudgetRequest,
};

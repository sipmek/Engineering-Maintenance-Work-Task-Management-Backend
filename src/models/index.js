const User = require('./User');
const Task = require('./Task');
const TaskActivity = require('./TaskActivity');
const TaskMember = require('./TaskMember');

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

module.exports = {
  User,
  Task,
  TaskActivity,
  TaskMember
};

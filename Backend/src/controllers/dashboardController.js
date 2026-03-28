const { Task, User, BudgetRequest } = require('../models');
const { Op } = require('sequelize');
const sendResponse = require('../utils/response');

exports.getStats = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const isAdminOrEmperor = ['admin', 'emperor'].includes(role);

    // 1. Task Stats
    const taskFilter = isAdminOrEmperor ? {} : { assigned_to: userId };
    const tasks = await Task.findAll({ where: taskFilter });
    
    const taskStats = {
      total: tasks.length,
      ongoing: tasks.filter(t => t.status === 'ongoing').length,
      hold: tasks.filter(t => t.status === 'hold').length,
      done: tasks.filter(t => t.status === 'done').length
    };

    let extraStats = {};

    if (isAdminOrEmperor) {
      // 2. User Stats
      const userCount = await User.count();
      
      // 3. Budget Stats
      const budgets = await BudgetRequest.findAll();
      const budgetStats = {
        totalRequested: budgets.reduce((acc, b) => acc + Number(b.estimated_cost), 0),
        totalApproved: budgets.filter(b => b.status === 'approved').reduce((acc, b) => acc + Number(b.estimated_cost), 0),
        totalSpent: budgets.reduce((acc, b) => acc + Number(b.actual_cost || 0), 0)
      };

      extraStats = {
        users: userCount,
        budgets: budgetStats
      };
    }

    return sendResponse(res, 200, 'success', 'Dashboard statistics retrieved successfully', {
      tasks: taskStats,
      ...extraStats
    });

  } catch (error) {
    return sendResponse(res, 500, 'error', error.message);
  }
};

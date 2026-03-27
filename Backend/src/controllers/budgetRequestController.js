const { BudgetRequest, TaskActivity, Task } = require("../models");

/**
 * Create a new budget request
 */
async function createBudgetRequest(req, res) {
  try {
    const { taskId } = req.params;
    const { title, description, estimated_cost } = req.body;
    const userId = req.user.id;

    // Check if task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task tidak ditemukan' });
    }

    const budget = await BudgetRequest.create({
      task_id: taskId,
      requested_by: userId,
      title,
      description,
      estimated_cost,
      status: 'pending'
    });

    // Add to task activity (timeline)
    await TaskActivity.create({
      task_id: taskId,
      user_id: userId,
      type: 'budget_request',
      message: `Mengajukan anggaran: ${title} sebesar Rp ${estimated_cost}`,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Approve a budget request
 */
async function approveBudget(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const budget = await BudgetRequest.findByPk(id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget request tidak ditemukan' });
    }

    if (budget.status !== 'pending') {
      return res.status(400).json({ message: 'Budget request sudah diproses' });
    }

    budget.status = 'approved';
    budget.approved_by = userId;
    budget.approved_at = new Date();

    await budget.save();

    // Add to task activity
    await TaskActivity.create({
      task_id: budget.task_id,
      user_id: userId,
      type: 'budget_approved',
      message: `Anggaran "${budget.title}" disetujui`,
    });

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Reject a budget request
 */
async function rejectBudget(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const budget = await BudgetRequest.findByPk(id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget request tidak ditemukan' });
    }

    if (budget.status !== 'pending') {
      return res.status(400).json({ message: 'Budget request sudah diproses' });
    }

    budget.status = 'rejected';
    budget.approved_by = userId;
    budget.approved_at = new Date();

    await budget.save();

    // Add to task activity
    await TaskActivity.create({
      task_id: budget.task_id,
      user_id: userId,
      type: 'budget_rejected',
      message: `Anggaran "${budget.title}" ditolak. Alasan: ${reason || 'Tidak ada alasan'}`,
    });

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * List all budget requests for a task
 */
async function getTaskBudgets(req, res) {
  try {
    const { taskId } = req.params;
    const budgets = await BudgetRequest.findAll({
      where: { task_id: taskId },
      include: [
        { model: require('../models').User, as: 'requester', attributes: ['username', 'photo'] },
        { model: require('../models').User, as: 'approver', attributes: ['username', 'photo'] }
      ]
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Update actual cost and upload receipt
 */
async function updateActualCost(req, res) {
  try {
    const { id } = req.params;
    const { actual_cost } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Bukti belanja (foto nota) wajib diunggah' });
    }

    const budget = await BudgetRequest.findByPk(id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget request tidak ditemukan' });
    }

    if (budget.status !== 'approved') {
      return res.status(400).json({ message: 'Hanya budget yang sudah disetujui yang bisa diupdate biaya riilnya' });
    }

    budget.actual_cost = actual_cost;
    budget.receipt_photo = req.file.path;

    await budget.save();

    // Add to task activity
    await TaskActivity.create({
      task_id: budget.task_id,
      user_id: userId,
      type: 'attachment',
      message: `Penyelesaian belanja budget "${budget.title}". Biaya riil: Rp ${actual_cost}. Nota terlampir.`,
      file_url: req.file.path,
      file_type: 'image'
    });

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * List all budget requests in the system (for Admin/Emperor)
 */
async function getAllBudgets(req, res) {
  try {
    const budgets = await BudgetRequest.findAll({
      include: [
        { model: Task, attributes: ['id', 'title', 'status'] },
        { model: require('../models').User, as: 'requester', attributes: ['username', 'photo'] },
        { model: require('../models').User, as: 'approver', attributes: ['username', 'photo'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createBudgetRequest,
  approveBudget,
  rejectBudget,
  getTaskBudgets,
  getAllBudgets,
  updateActualCost
};

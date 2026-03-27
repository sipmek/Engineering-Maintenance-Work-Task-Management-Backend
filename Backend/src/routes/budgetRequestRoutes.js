const express = require('express');
const router = express.Router();

const {
  createBudgetRequest,
  approveBudget,
  rejectBudget,
  getTaskBudgets,
  getAllBudgets,
  updateActualCost
} = require('../controllers/budgetRequestController');

const { protect } = require('../middlewares/authMiddleware');
const { canApproveBudget } = require('../middlewares/budgetRequestMiddleware');
const { checkTaskAccess } = require('../middlewares/taskAccessMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// 🔹 List all budgets (Admin/Emperor)
router.get(
  '/budgets',
  protect,
  canApproveBudget,
  getAllBudgets
);

// 🔹 Create Budget
router.post(
  '/tasks/:taskId/budget',
  protect,
  canApproveBudget,
  checkTaskAccess,
  createBudgetRequest
);

// 🔹 Approve
router.patch(
  '/budget/:id/approve',
  protect,
  canApproveBudget,
  approveBudget
);

// 🔹 Reject
router.patch(
  '/budget/:id/reject',
  protect,
  canApproveBudget,
  rejectBudget
);

// 🔹 Update Actual Cost & Receipt
router.patch(
  '/budget/:id/actual-cost',
  protect,
  canApproveBudget,
  upload.single('receipt'),
  updateActualCost
);

// 🔹 List budget per task
router.get(
  '/tasks/:taskId/budgets',
  protect,
  canApproveBudget,
  checkTaskAccess,
  getTaskBudgets
);

module.exports = router;
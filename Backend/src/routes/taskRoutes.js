const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  createTask,
  getTaskDetail,
  createActivity,
  getTasks,
  getUsers,
  updateTask,
  deleteTask,
  updateActivity,
  deleteActivity,
} = require("../controllers/taskController");

router.get("/users/list", protect, getUsers);
const {
  addMember,
  getMembers,
  removeMember,
} = require("../controllers/taskMemberController");
const { checkTaskAccess } = require("../middlewares/taskAccessMiddleware");

// semua role boleh create task
router.post("/", protect, createTask);

// semua role boleh melihat detail task
router.get("/:id", protect, checkTaskAccess, getTaskDetail);

// Edit Task
router.put("/:id", protect, checkTaskAccess, updateTask);

// Delete Task
router.delete("/:id", protect, checkTaskAccess, deleteTask);

router.post(
  "/:taskId/activities",
  protect,
  checkTaskAccess,
  upload.single("file"),
  createActivity,
);

// Edit Task Activity
router.put(
  "/:taskId/activities/:activityId",
  protect,
  checkTaskAccess,
  updateActivity
);

// Delete Task Activity
router.delete(
  "/:taskId/activities/:activityId",
  protect,
  checkTaskAccess,
  deleteActivity
);

// 👥 add member
router.post("/:taskId/members", protect, checkTaskAccess, addMember);

// 📋 list member
router.get("/:taskId/members", protect, checkTaskAccess, getMembers);

router.get("/", protect, getTasks);

// ❌ remove member
router.delete(
  "/:taskId/members/:userId",
  protect,
  checkTaskAccess,
  removeMember,
);

module.exports = router;

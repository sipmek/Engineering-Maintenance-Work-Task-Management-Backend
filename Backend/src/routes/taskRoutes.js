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

router.post(
  "/:taskId/activities",
  protect,
  checkTaskAccess,
  upload.single("file"),
  createActivity,
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

const { Task, TaskActivity, User, TaskMember, BudgetRequest } = require("../models");
const sendResponse = require("../utils/response");
const { Op } = require("sequelize");


const createTask = async (req, res, next) => {
  try {
    const { title, description, category, priority, assigned_to, deadline } =
      req.body;

    // 🔐 VALIDASI
    if (!title || !category) {
      return sendResponse(res, 400, "fail", "Title dan category wajib diisi!");
    }

    // 🧠 ambil user dari JWT
    const userId = req.user.id;

    const allowedCategory = [
      "teknik",
      "it",
      "engineering",
      "teknologi",
      "lossprevention",
      "infrastruktur",
    ];

    if (!allowedCategory.includes(category)) {
      return sendResponse(res, 400, "fail", "Kategori tidak valid!");
    }

    // 🧱 CREATE TASK
    const newTask = await Task.create({
      title,
      description,
      category,
      priority,
      assigned_to: assigned_to || null,
      created_by: userId,
      deadline: deadline || null,
      started_at: new Date(), // langsung ongoing
    });

    // 🔥 AUTO ACTIVITY LOG
    await TaskActivity.create({
      task_id: newTask.id,
      user_id: userId,
      type: "comment",
      message: `Task dibuat oleh ${req.user.username}`,
    });

    return sendResponse(res, 201, "success", `Task dibuat oleh ${req.user.username}`, newTask);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, assigned_to, deadline } = req.body;
    const currentUser = req.user;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ status: "fail", message: "Task tidak ditemukan!" });
    }

    // RBAC: Hanya Emperor, Admin, atau Pembuat (creator)
    if (currentUser.role !== 'emperor' && currentUser.role !== 'admin' && task.created_by !== currentUser.id) {
      return res.status(403).json({ status: "fail", message: "Tidak punya akses untuk mengedit task ini!" });
    }

    // Capture old values mapping to log
    let changes = [];
    if (title && task.title !== title) changes.push(`Judul`);
    if (description && task.description !== description) changes.push(`Deskripsi`);
    if (category && task.category !== category) changes.push(`Kategori`);
    if (priority && task.priority !== priority) changes.push(`Prioritas`);
    if (deadline && new Date(task.deadline).getTime() !== new Date(deadline).getTime()) changes.push(`Deadline`);

    await task.update({
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      category: category || task.category,
      priority: priority || task.priority,
      assigned_to: assigned_to !== undefined ? assigned_to : task.assigned_to,
      deadline: deadline !== undefined ? deadline : task.deadline,
    });

    if (changes.length > 0 || assigned_to !== undefined) {
      const changeText = changes.length > 0 ? changes.join(", ") : "Assignee / Atribut lainnya";
      await TaskActivity.create({
        task_id: task.id,
        user_id: currentUser.id,
        type: "progress",
        message: `Task diedit oleh ${currentUser.username}. Perubahan: ${changeText}.`,
      });
    }

    return sendResponse(res, 200, "success", "Task berhasil diperbarui!");
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ status: "fail", message: "Task tidak ditemukan!" });
    }

    // RBAC: Hanya Emperor, Admin, atau Pembuat
    if (currentUser.role !== 'emperor' && currentUser.role !== 'admin' && task.created_by !== currentUser.id) {
      return res.status(403).json({ status: "fail", message: "Tidak punya akses untuk menghapus task ini!" });
    }

    // Manual Cascade Delete untuk menghindari error Foreign Key Constraint
    await TaskActivity.destroy({ where: { task_id: id } });
    await TaskMember.destroy({ where: { task_id: id } });
    if (BudgetRequest) {
      await BudgetRequest.destroy({ where: { task_id: id } });
    }

    await task.destroy();

    return sendResponse(res, 200, "success", "Task berhasil dihapus!");
  } catch (err) {
    next(err);
  }
};

const getTaskDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log('Mencari task dengan ID:', id);
    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "role"],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "role"],
        },
        {
          model: TaskActivity,
          separate: true,
          order: [["createdAt", "ASC"]],
          attributes: [
            "id",
            "type",
            "message",
            "amount",
            "status_update",
            "file_url",
            "file_type",
            "createdAt",
          ],
          include: [
            {
              model: User,
              attributes: ["id", "username", "photo"],
            },
          ],
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        status: "fail",
        message: "Task tidak ditemukan!",
      });
    }

    return sendResponse(res, 200, "success", "Detail task berhasil diambil!", task);
  } catch (err) {
    next(err);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const { type, message, amount, status_update } = req.body;

    const userId = req.user.id;

    // 🔍 cek task ada
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        status: "fail",
        message: "Task tidak ditemukan!",
      });
    }

    // 🔐 validasi type
    const allowedTypes = [
      "comment",
      "progress",
      "budget_request",
      "status_update",
      "attachment",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        status: "fail",
        message: "Tipe activity tidak valid!",
      });
    }

    // 🔐 validasi khusus per type

    // 💬 comment / progress
    if ((type === "comment" || type === "progress") && !message) {
      return res.status(400).json({
        status: "fail",
        message: "Message wajib diisi!",
      });
    }

    // 💰 budget
    if (type === "budget_request") {
      if (!amount || amount <= 0) {
        return res.status(400).json({
          status: "fail",
          message: "Amount harus diisi dan > 0!",
        });
      }
    }

    // 🔄 status update
    if (type === "status_update") {
      const allowedStatus = ["ongoing", "hold", "done"];

      if (!status_update || !allowedStatus.includes(status_update)) {
        return res.status(400).json({
          status: "fail",
          message: "Status tidak valid!",
        });
      }
    }

    // 📸 file upload (sementara dari body dulu)
    let file_url = null;
    let file_type = null;

    if (req.file) {
      file_url = `uploads/${req.file.filename}`;

      if (req.file.mimetype.startsWith("image")) {
        file_type = "image";
      } else {
        file_type = "document";
      }
    }

    // 🧱 CREATE ACTIVITY
    const activity = await TaskActivity.create({
      task_id: taskId,
      user_id: userId,
      type,
      message: message || null,
      amount: amount || null,
      status_update: status_update || null,
      file_url,
      file_type,
    });

    // 🔥 UPDATE TASK JIKA STATUS BERUBAH
    if (type === "status_update") {
      task.status = status_update;

      if (status_update === "done") {
        task.completed_at = new Date();
      }

      await task.save();
    }

    return sendResponse(res, 201, "success", "Activity berhasil ditambahkan!", activity);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const { taskId, activityId } = req.params;
    const { message, status_update } = req.body;
    const currentUser = req.user;

    const activity = await TaskActivity.findOne({
      where: { id: activityId, task_id: taskId },
    });

    if (!activity) {
      return res.status(404).json({ status: "fail", message: "Activity tidak ditemukan!" });
    }

    // RBAC: Hanya Emperor, Admin, atau pembuat activity
    if (currentUser.role !== 'emperor' && currentUser.role !== 'admin' && activity.user_id !== currentUser.id) {
      return res.status(403).json({ status: "fail", message: "Anda tidak punya akses untuk mengedit activity ini!" });
    }

    const oldMessage = activity.message;
    let changes = [];
    
    if (message !== undefined && message !== activity.message) {
      activity.message = message;
      changes.push("Pesan");
    }
    
    if (status_update !== undefined && status_update !== activity.status_update) {
      activity.status_update = status_update;
      changes.push("Status Update");
    }

    await activity.save();

    // Buat log bahwa activity diedit jika ada log message 
    if (changes.length > 0) {
      await TaskActivity.create({
        task_id: taskId,
        user_id: currentUser.id,
        type: "comment",
        message: `Komentar/Aktivitas sebelumnya telah diedit oleh ${currentUser.username}. Perubahan: ${changes.join(", ")}`,
      });
    }

    return sendResponse(res, 200, "success", "Activity berhasil diperbarui!");
  } catch (err) {
    next(err);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const { taskId, activityId } = req.params;
    const currentUser = req.user;

    const activity = await TaskActivity.findOne({
      where: { id: activityId, task_id: taskId },
    });

    if (!activity) {
      return res.status(404).json({ status: "fail", message: "Activity tidak ditemukan!" });
    }

    // RBAC: Hanya Emperor, Admin, atau pembuat activity
    if (currentUser.role !== 'emperor' && currentUser.role !== 'admin' && activity.user_id !== currentUser.id) {
      return res.status(403).json({ status: "fail", message: "Anda tidak punya akses untuk menghapus activity ini!" });
    }

    await activity.destroy();

    return sendResponse(res, 200, "success", "Activity berhasil dihapus!");
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const user = req.user;

    const {
      status,
      category,
      priority,
      search,
      mine,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    if (search) {
      where.title = {
        [Op.like]: `%${search}%`,
      };
    }

    if (mine === "true") {
      where.created_by = user.id;
    } else if (user.role === "user") {
      // 🔐 ROLE FILTER + MEMBER (Only for normal users if not filtering by 'mine')
      const memberTasks = await TaskMember.findAll({
        where: { user_id: user.id },
        attributes: ["task_id"],
      });

      const memberTaskIds = memberTasks.map((m) => m.task_id);

      where[Op.or] = [
        { created_by: user.id },
        { assigned_to: user.id },
        { id: memberTaskIds },
      ];
    }

    const offset = (page - 1) * limit;

    const tasks = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "photo"],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return sendResponse(res, 200, "success", "Data task berhasil diambil!", {
      total: tasks.count,
      page: parseInt(page),
      totalPages: Math.ceil(tasks.count / limit),
      tasks: tasks.rows,
    });

  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "role", "photo"],
      where: {
        status: "active",
      },
    });

    return sendResponse(res, 200, "success", "Data user berhasil diambil!", users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getTaskDetail,
  createActivity,
  updateActivity,
  deleteActivity,
  getTasks,
  getUsers,
};

const { Task, TaskActivity, User , TaskMember } = require("../models");

const { Op } = require("sequelize");


const createTask = async (req, res, next) => {
  try {
    const { title, description, category, priority, assigned_to, deadline } =
      req.body;

    // 🔐 VALIDASI
    if (!title || !category) {
      return res.status(400).json({
        status: "fail",
        message: "Title dan category wajib diisi!",
      });
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
      return res.status(400).json({
        status: "fail",
        message: "Kategori tidak valid!",
      });
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

    res.status(201).json({
      status: "success",
      data: newTask,
      message: `Task dibuat oleh ${req.user.username}`,
    });
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

    res.status(200).json({
      status: "success",
      data: task,
    });
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

    res.status(201).json({
      status: "success",
      data: activity,
      message: "Activity berhasil ditambahkan!",
    });
  } catch (err) {
    console.error(err);
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

    res.status(200).json({
      status: "success",
      total: tasks.count,
      page: parseInt(page),
      totalPages: Math.ceil(tasks.count / limit),
      data: tasks.rows,
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

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTaskDetail,
  createActivity,
  getTasks,
  getUsers,
};

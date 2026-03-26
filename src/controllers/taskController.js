const { Task, TaskActivity, User } = require("../models");

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
              attributes: ["id", "username"],
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

    const {
      type,
      message,
      amount,
      status_update
    } = req.body;

    const userId = req.user.id;

    // 🔍 cek task ada
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task tidak ditemukan!',
      });
    }

    // 🔐 validasi type
    const allowedTypes = [
      'comment',
      'progress',
      'budget_request',
      'status_update',
      'attachment'
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tipe activity tidak valid!',
      });
    }

    // 🔐 validasi khusus per type

    // 💬 comment / progress
    if ((type === 'comment' || type === 'progress') && !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Message wajib diisi!',
      });
    }

    // 💰 budget
    if (type === 'budget_request') {
      if (!amount || amount <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Amount harus diisi dan > 0!',
        });
      }
    }

    // 🔄 status update
    if (type === 'status_update') {
      const allowedStatus = ['ongoing', 'hold', 'done'];

      if (!status_update || !allowedStatus.includes(status_update)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Status tidak valid!',
        });
      }
    }

    // 📸 file upload (sementara dari body dulu)
    let file_url = null;
    let file_type = null;

    if (type === 'attachment') {
      if (!req.body.file_url) {
        return res.status(400).json({
          status: 'fail',
          message: 'File URL wajib!',
        });
      }

      file_url = req.body.file_url;
      file_type = req.body.file_type || 'image';
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
    if (type === 'status_update') {
      task.status = status_update;

      if (status_update === 'done') {
        task.completed_at = new Date();
      }

      await task.save();
    }

    res.status(201).json({
      status: 'success',
      data: activity,
      message: 'Activity berhasil ditambahkan!',
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};


module.exports = {
  createTask,
  getTaskDetail,createActivity
};

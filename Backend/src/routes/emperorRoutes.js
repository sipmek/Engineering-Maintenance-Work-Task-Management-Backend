const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { getAllUsers ,createUser,updateUser,banUser,activateUser,resetPassword,uploadAvatar } = require('../controllers/emperorController');

router.get('/users', protect, authorize('emperor'), getAllUsers);
router.post('/users', protect, authorize('emperor'), createUser);
router.put('/users/:id', protect, authorize('emperor'), updateUser);
router.patch('/users/:id/ban', protect, authorize('emperor'), banUser);
router.patch('/users/:id/activate', protect, authorize('emperor'), activateUser);
router.patch('/users/:id/reset-password', protect, authorize('emperor'), resetPassword);
router.patch('/users/:id/photo', protect, authorize('emperor'), upload.single('photo'), uploadAvatar);

module.exports = router;
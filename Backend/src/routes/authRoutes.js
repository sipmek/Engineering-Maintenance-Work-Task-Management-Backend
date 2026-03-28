const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');
const { login } = require('../controllers/loginController');

router.post('/login', (req, req_res, next) => {
  const loginLimiter = req.app.get('loginLimiter');
  if (loginLimiter) return loginLimiter(req, req_res, next);
  next();
}, login);
// router.post('/register', register);

module.exports = router;
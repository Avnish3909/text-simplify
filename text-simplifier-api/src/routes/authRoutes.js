// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  updatePassword,
  updateMe
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect);
router.get('/me', getCurrentUser);
router.patch('/update-password', updatePassword);
router.patch('/update-me', updateMe);

module.exports = router;
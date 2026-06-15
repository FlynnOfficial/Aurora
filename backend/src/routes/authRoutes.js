// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 4 }).trim()
  ],
  authController.login
);

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 4 }),
    body('name').notEmpty().trim(),
    body('role').isIn(['admin', 'teacher', 'secretary', 'student'])
  ],
  authController.register
);

// Get current user
router.get('/me', authMiddleware, authController.me);

module.exports = router;
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

// Register
router.post('/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']),
  ],
  validate,
  auth.register
);

// Login
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  auth.login
);

// Logout
router.post('/logout', protect, auth.logout);

// Get current user
router.get('/me', protect, auth.getMe);

// Update profile
router.put('/profile', protect,
  [
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']),
    body('theme').optional().isIn(['dark', 'light']),
  ],
  validate,
  auth.updateProfile
);

// Change password
router.put('/change-password', protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  auth.changePassword
);

// Forgot password
router.post('/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  auth.forgotPassword
);

// Reset password
router.post('/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  auth.resetPassword
);

module.exports = router;

/**
 * Auth Routes
 * Maps auth endpoints to validation middleware and controllers.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Register a new user
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

// Login a user
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// Refresh access token (accepts refresh token from body or HTTP-only cookies)
router.post('/refresh', authController.refresh);

// Logout (requires authentication)
router.post('/logout', authenticate, authController.logout);

// Get current logged-in user profile details (requires authentication)
router.get('/me', authenticate, authController.getMe);

module.exports = router;

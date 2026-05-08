/**
 * @fileoverview Authentication routes.
 * Handles user registration, login, token refresh, and profile management.
 */

import express from 'express';
import * as authController from '../controllers/authController.js';
import {authenticate} from '../middlewares/authMiddleware.js';
import {authLimiter} from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes (Rate limited to prevent brute force attacks)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes (Require valid JWT)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/profile/driver', authenticate, authController.updateDriverProfile);
router.put(
  '/change-password',
  authLimiter,
  authenticate,
  authController.changePassword
);

// Debugging route
router.get('/test', (req, res) => {
  res.json({
    message: 'Server works',
    url: req.url,
    method: req.method,
  });
});

export default router;

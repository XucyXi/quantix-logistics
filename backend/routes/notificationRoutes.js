/**
 * @fileoverview Notification routes.
 * Handles fetching, creating, and marking notifications/announcements as read.
 */

import express from 'express';
import {authenticate} from '../middlewares/authMiddleware.js';
import {requireRole} from '../middlewares/roleMiddleware.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// Fetch notifications for the authenticated user
router.get('/', authenticate, notificationController.getNotifications);

// Create a system-wide announcement (Admin only)
router.post(
  '/announcements',
  authenticate,
  requireRole('admin'),
  notificationController.createAnnouncement
);

// Mark a specific notification as read
router.patch(
  '/:id/read',
  authenticate,
  notificationController.markNotificationAsRead
);

export default router;

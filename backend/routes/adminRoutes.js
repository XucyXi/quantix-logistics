/**
 * @fileoverview Admin routes.
 * Protected routes restricted to users with the 'admin' role.
 * Handles dashboard analytics, system settings, and route overviews.
 */

import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import * as settingsController from '../controllers/settingsController.js';
import * as adminController from '../controllers/adminController.js';

import {authenticate} from '../middlewares/authMiddleware.js';
import {requireRole} from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply global authentication and admin role verification for all routes in this file
router.use(authenticate);
router.use(requireRole('admin'));

// Analytics & Settings
router.get('/analytics/revenue', analyticsController.getRevenueStats);
router.get('/analytics/orders', analyticsController.getOrderStats);
router.put('/settings/system', settingsController.updateSystemSettings);
router.post('/settings/smtp/test', settingsController.testSmtp);

// Admin Dashboard / Operations
router.get('/routes/overview', adminController.getRoutesOverview);
router.get('/notifications', adminController.getNotifications);
router.get('/analytics', adminController.getAnalytics);

export default router;

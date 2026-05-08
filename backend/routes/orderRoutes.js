/**
 * @fileoverview Order management routes.
 * Handles order creation, fetching, status updates, and driver assignments.
 * Divided by access level: General, Customer, Driver, and Admin.
 */

import express from 'express';
import * as orderController from '../controllers/orderController.js';
import {authenticate} from '../middlewares/authMiddleware.js';
import {requireRole} from '../middlewares/roleMiddleware.js';
import {orderLimiter} from '../middlewares/rateLimiter.js';

const router = express.Router();

// ==========================================
// CUSTOMER ROUTES (Must precede /:id routes)
// ==========================================
router.get('/customer/stats', authenticate, orderController.getOrderStats);
router.get('/customer/all', authenticate, orderController.getCustomerOrders);

// ==========================================
// DRIVER ROUTES
// ==========================================
router.get(
  '/driver/assigned',
  authenticate,
  requireRole('driver'),
  orderController.getAssignedOrders
);
router.put(
  '/driver/availability',
  authenticate,
  requireRole('driver'),
  orderController.updateAvailability
);

// ==========================================
// ADMIN ROUTES
// ==========================================
router.get(
  '/admin/all',
  authenticate,
  requireRole('admin'),
  orderController.getAllOrdersAdmin
);
router.get(
  '/admin/drivers',
  authenticate,
  requireRole('admin'),
  orderController.getAllDrivers
);
router.put(
  '/:id/assign',
  authenticate,
  requireRole('admin'),
  orderController.assignDriver
);
router.put(
  '/:id/cancel',
  authenticate,
  requireRole('admin'),
  orderController.cancelOrder
);

// ==========================================
// GENERAL / SHARED ROUTES
// ==========================================
router.get('/cursor', authenticate, orderController.getOrdersCursor);
router.post('/', orderLimiter, authenticate, orderController.createOrder);
router.get('/:id', authenticate, orderController.getOrder);
router.put('/:id/status', authenticate, orderController.updateOrderStatus);

export default router;

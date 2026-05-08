/**
 * @fileoverview Delivery tracking and GPS routes.
 * Handles fetching active drivers and posting driver location updates.
 */

import express from 'express';
import * as deliveryController from '../controllers/deliveryController.js';
import {authenticate} from '../middlewares/authMiddleware.js';
import {gpsLimiter} from '../middlewares/rateLimiter.js';

const router = express.Router();

// Fetch all active delivery locations (Admin/Dashboard use)
router.get('/active', authenticate, deliveryController.getAllActiveLocations);

// Driver pushes their current location (Strict rate limit)
router.post(
  '/:orderId/location',
  gpsLimiter,
  authenticate,
  deliveryController.updateLocation
);

// Customer fetches tracking data for their specific order
router.get(
  '/:orderId/status',
  authenticate,
  deliveryController.getTrackingData
);

export default router;

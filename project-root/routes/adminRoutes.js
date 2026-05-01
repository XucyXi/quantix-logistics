// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get(
  '/analytics/revenue',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  analyticsController.getRevenueStats
);

router.get(
  '/analytics/orders',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  analyticsController.getOrderStats
);

module.exports = router;
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

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

router.put(
  '/settings/system',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  settingsController.updateSystemSettings
);

router.post(
  '/settings/smtp/test',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  settingsController.testSmtp
);

module.exports = router;

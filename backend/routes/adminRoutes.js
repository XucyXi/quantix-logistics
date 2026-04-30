const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get(
  '/analytics/revenue',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  analyticsController.getRevenueStats
);

module.exports = router;

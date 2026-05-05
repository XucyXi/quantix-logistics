const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authMiddleware.authenticate, notificationController.getNotifications);

router.post(
  '/announcements',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  notificationController.createAnnouncement
);

router.patch(
  '/:id/read',
  authMiddleware.authenticate,
  notificationController.markNotificationAsRead
);

module.exports = router;

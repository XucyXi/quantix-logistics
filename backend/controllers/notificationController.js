const db = require('../config/db');
const notificationService = require('../services/notificationService');

async function getNotifications(req, res) {
  try {
    const userId = req.user.user_id;
    const limit = Number.parseInt(req.query.limit, 10) || 20;

    const notifications = await notificationService.getUserNotifications(
      userId,
      limit
    );

    const [announcements] = await db.query(
      `SELECT announcement_id, title, content, created_at, expires_at
       FROM ANNOUNCEMENTS
       WHERE expires_at IS NULL OR expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 20`
    );

    const unreadCount = notifications.filter((item) => !item.read_at).length;

    return res.json({
      notifications,
      announcements,
      unreadCount,
      announcementCount: announcements.length,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error.message);
    return res.status(500).json({error: 'Failed to fetch notifications'});
  }
}

async function createAnnouncement(req, res) {
  try {
    const {title, content, expires_at} = req.body;
    const normalizedExpiresAt =
      expires_at && String(expires_at).trim()
        ? String(expires_at).replace('T', ' ')
        : null;

    if (!title || !String(title).trim()) {
      return res.status(400).json({error: 'Title is required'});
    }

    const [result] = await db.query(
      `INSERT INTO ANNOUNCEMENTS (title, content, created_at, expires_at)
       VALUES (?, ?, NOW(), ?)`,
      [
        String(title).trim(),
        content ? String(content).trim() : null,
        normalizedExpiresAt,
      ]
    );

    const [rows] = await db.query(
      `SELECT announcement_id, title, content, created_at, expires_at
       FROM ANNOUNCEMENTS
       WHERE announcement_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      announcement: rows[0] || null,
    });
  } catch (error) {
    console.error('Failed to create announcement:', error.message);
    return res.status(500).json({error: 'Failed to create announcement'});
  }
}

async function markNotificationAsRead(req, res) {
  try {
    const notificationId = Number.parseInt(req.params.id, 10);
    const userId = req.user.user_id;

    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({error: 'Invalid notification id'});
    }

    const [ownedNotification] = await db.query(
      `SELECT notification_id FROM NOTIFICATIONS
       WHERE notification_id = ? AND user_id = ?
       LIMIT 1`,
      [notificationId, userId]
    );

    if (!ownedNotification.length) {
      return res.status(404).json({error: 'Notification not found'});
    }

    await notificationService.markNotificationAsRead(notificationId);
    return res.json({success: true});
  } catch (error) {
    console.error('Failed to mark notification as read:', error.message);
    return res.status(500).json({error: 'Failed to update notification'});
  }
}

module.exports = {
  getNotifications,
  createAnnouncement,
  markNotificationAsRead,
};

/**
 * @fileoverview Admin Controller.
 * Handles high-level dashboard data, analytics, and system overviews.
 */

import * as adminService from '../services/adminService.js';

/**
 * Retrieves an overview of active routes and deliveries for the admin dashboard.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response containing route data.
 */
export async function getRoutesOverview(req, res) {
  try {
    const routes = await adminService.getRoutesOverview();
    res.json({success: true, routes});
  } catch (error) {
    res
      .status(500)
      .json({success: false, message: 'Server error fetching routes'});
  }
}

/**
 * Retrieves system-wide notifications and announcements.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response containing announcements and alerts.
 */
export async function getNotifications(req, res) {
  try {
    const {announcements, alerts} = await adminService.getSystemNotifications();
    res.json({
      success: true,
      announcements,
      notifications: alerts,
    });
  } catch (error) {
    res
      .status(500)
      .json({success: false, message: 'Server error fetching notifications'});
  }
}

/**
 * Retrieves basic analytics statistics for the admin dashboard.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response containing analytics stats.
 */
export async function getAnalytics(req, res) {
  try {
    const stats = await adminService.getBasicAnalytics();
    res.json({success: true, stats});
  } catch (error) {
    res
      .status(500)
      .json({success: false, message: 'Server error fetching analytics'});
  }
}

/**
 * @fileoverview Analytics Controller.
 * Handles data aggregation for revenue, orders, and business metrics.
 */

import pool from '../config/db.js';

/**
 * Retrieves revenue statistics for the last 30 days.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response with total revenue, order counts, and averages.
 */
export async function getRevenueStats(req, res) {
  try {
    const query = `
      SELECT
        SUM(total_price) as total_revenue,
        COUNT(*) as total_orders,
        AVG(total_price) as avg_order_value,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as delivered
      FROM orders
      WHERE ordered_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    const [statsResult] = await pool.query(query);

    res.json({success: true, stats: statsResult[0]});
  } catch (error) {
    res
      .status(500)
      .json({success: false, error: 'Failed to fetch revenue stats'});
  }
}

/**
 * Retrieves order counts grouped by their current status.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response with an array of statuses and their counts.
 */
export async function getOrderStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    return res.json({success: true, stats: rows});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order stats',
    });
  }
}

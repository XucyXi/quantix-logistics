// backend/controllers/analyticsController.js
const pool = require('../config/db');

async function getRevenueStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        COALESCE(SUM(total_price), 0) AS total_revenue,
        COUNT(*) AS total_orders,
        COALESCE(AVG(total_price), 0) AS avg_order_value,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS delivered_orders
      FROM ORDERS
      WHERE ordered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    return res.json({ success: true, stats: rows[0] });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue stats',
      error: error.message,
    });
  }
}

async function getOrderStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM ORDERS
      GROUP BY status
    `);

    return res.json({ success: true, stats: rows });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order stats',
      error: error.message,
    });
  }
}

module.exports = {
  getRevenueStats,
  getOrderStats,
};
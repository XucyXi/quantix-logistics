const pool = require('../config/db');

async function getRevenueStats(req, res) {
  try {
    const query = `
      SELECT
        SUM(total_price) as total_revenue,
        COUNT(*) as total_orders,
        AVG(total_price) as avg_order_value,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as delivered
      FROM ORDERS
      WHERE ordered_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    const [statsResult] = await pool.query(query);

    res.json({success: true, stats: statsResult[0]});
  } catch (error) {
    console.error('Error getting revenue stats:', error.message);
    res.status(500).json({error: error.message});
  }
}

module.exports = {
  getRevenueStats,
};

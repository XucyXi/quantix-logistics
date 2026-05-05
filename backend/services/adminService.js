const db = require('../config/db');

exports.getRoutesOverview = async () => {
  const query = `
    SELECT 
      u.user_id AS driverId,
      u.full_name AS driverName,
      dp.vehicle_info AS vehicleInfo,
      COUNT(o.order_id) AS totalStops,
      SUM(CASE WHEN o.status = 'done' THEN 1 ELSE 0 END) AS completedStops,
      SUM(CASE WHEN o.status = 'stuck' THEN 1 ELSE 0 END) AS stuckCount
    FROM USERS u
    JOIN DRIVER_PROFILES dp ON u.user_id = dp.user_id
    JOIN ORDERS o ON u.user_id = o.driver_id
    WHERE o.status != 'cancelled'
    GROUP BY u.user_id, u.full_name, dp.vehicle_info
    HAVING totalStops > completedStops
  `;

  const [rows] = await db.execute(query);

  // Muotoillaan data suoraan täällä
  return rows.map((r) => ({
    driverId: r.driverId,
    driverName: r.driverName || 'Tuntematon Kuski',
    vehicleInfo: r.vehicleInfo || 'Ei ajoneuvoa',
    totalStops: r.totalStops,
    completedStops: r.completedStops,
    status: r.stuckCount > 0 ? 'stuck' : 'in_progress',
    area: 'Pääkaupunkiseutu',
  }));
};

exports.getSystemNotifications = async () => {
  const [announcements] = await db.execute(`
    SELECT announcement_id, title, content, created_at, expires_at 
    FROM ANNOUNCEMENTS 
    ORDER BY created_at DESC LIMIT 5
  `);

  const [alerts] = await db.execute(`
    SELECT notification_id, title, message, type, created_at 
    FROM NOTIFICATIONS 
    WHERE type IN ('warning', 'error')
    ORDER BY created_at DESC LIMIT 10
  `);

  return {announcements, alerts};
};

exports.getBasicAnalytics = async () => {
  const [rows] = await db.execute(`
    SELECT COUNT(*) as deliveredToday 
    FROM ORDERS 
    WHERE status = 'done' AND DATE(order_finished) = CURDATE()
  `);

  return {
    delivered: rows[0].deliveredToday || 0,
  };
};

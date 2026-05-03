const db = require('../config/db');

exports.createTrackingPoint = async (orderId, data) => {
  const {latitude, longitude} = data;

  const query = `
        INSERT INTO DELIVERY_TRACKING (order_id, latitude, longitude, updated_at)
        VALUES (?, ?, ?, ?, NOW())
    `;

  try {
    const [result] = await db.execute(query, [
      orderId,
      latitude,
      longitude
    ]);
    return result;
  } catch (error) {
    console.error('Tietokantavirhe delivery_tracking-taulussa:', error);
    throw error;
  }
};

exports.getLatestLocation = async (orderId) => {
  const query = `
        SELECT latitude as lat, longitude as lng, updated_at
        FROM DELIVERY_TRACKING
        WHERE ORDER_ID = ?
        ORDER BY UPDATED_AT DESC
        LIMIT 1
    `;
  const [rows] = await db.execute(query, [orderId]);
  return rows[0] || null;
};

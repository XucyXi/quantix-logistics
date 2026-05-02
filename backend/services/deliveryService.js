const db = require('../config/db');
const {route} = require('../routes/deliveryRoutes');

exports.createTrackingPoint = async (orderId, data) => {
  const {latitude, longitude, status} = data;

  const query = `
        INSERT INTO DELIVERY_TRACKING (order_id, latitude, longitude, status, updated_at)
        VALUES (?, ?, ?, ?, NOW())
    `;

  try {
    const [result] = await db.execute(query, [
      orderId,
      latitude,
      longitude,
      status || 'in-transit',
    ]);
    return result;
  } catch (error) {
    console.error('Tietokantavirhe delivery_tracking-taulussa:', error);
    throw error;
  }
};

exports.getLatestLocation = async (orderId) => {
  const query = `
        SELECT latitude, longitude, updated_at
        FROM DELIVERY_TRACKING
        WHERE ORDER_ID = ?
        ORDER BY updated_at DESC
        LIMIT 1
    `;
  const [rows] = await db.execute(query, [orderId]);
  console.log('rows', rows);
  return rows[0] || null;
};

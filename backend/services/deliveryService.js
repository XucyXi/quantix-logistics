const db = require('../config/db');

exports.createTrackingPoint = async (orderId, data) => {
  const {latitude, longitude} = data;

  try {
    // 1. Yritetään ensin päivittää olemassa olevaa riviä
    const updateQuery = `
      UPDATE delivery_tracking 
      SET latitude = ?, longitude = ?, updated_at = NOW()
      WHERE order_id = ?
    `;
    const [updateResult] = await db.execute(updateQuery, [
      latitude,
      longitude,
      orderId,
    ]);

    // 2. Jos päivitys ei koskenut yhtään riviä (tilausta ei ole vielä seurannassa), luodaan se
    if (updateResult.affectedRows === 0) {
      const insertQuery = `
        INSERT INTO delivery_tracking (order_id, latitude, longitude, updated_at)
        VALUES (?, ?, ?, NOW())
      `;
      await db.execute(insertQuery, [orderId, latitude, longitude]);
    }

    return {success: true};
  } catch (error) {
    console.error('Tietokantavirhe delivery_tracking-taulussa:', error);
    throw error;
  }
};

exports.getLatestLocation = async (orderId) => {
  const query = `
        SELECT latitude as lat, longitude as lng, updated_at
        FROM delivery_tracking
        WHERE order_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
    `;
  const [rows] = await db.execute(query, [orderId]);
  return rows[0] || null;
};

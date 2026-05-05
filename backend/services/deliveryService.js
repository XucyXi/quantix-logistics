/**
 * @fileoverview Delivery Tracking Service.
 * Handles the creation and retrieval of GPS tracking points for active deliveries.
 */

import db from '../config/db.js';

/**
 * Creates or updates a GPS tracking point for an active order.
 *
 * @param {number|string} orderId - The ID of the order being tracked.
 * @param {Object} data - Contains latitude and longitude.
 * @returns {Promise<{success: boolean}>}
 */
export const createTrackingPoint = async (orderId, data) => {
  const {latitude, longitude} = data;

  try {
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

/**
 * Retrieves the most recent GPS location for a specific order.
 *
 * @param {number|string} orderId - The order ID.
 * @returns {Promise<Object|null>} The latest coordinates and timestamp, or null.
 */
export const getLatestLocation = async (orderId) => {
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

/**
 * Retrieves all active driver locations (for orders currently 'in_transit').
 * Used primarily for the admin live map.
 *
 * @returns {Promise<Array>} List of active tracking points with destination details.
 */
export const getAllActiveLocations = async () => {
  const query = `
    SELECT
      t.order_id,
      t.latitude AS driver_lat,
      t.longitude AS driver_lng,
      t.updated_at,
      o.delivery_address,
      o.latitude AS dest_lat,
      o.longitude AS dest_lng,
      o.status,
      o.driver_id
    FROM delivery_tracking t
    JOIN orders o ON t.order_id = o.order_id
    WHERE o.status = 'in_transit'
  `;
  const [rows] = await db.execute(query);
  return rows;
};

/**
 * @fileoverview Delivery Controller.
 * Handles tracking and location updates for drivers, and tracking queries for customers.
 */

import * as deliveryService from '../services/deliveryService.js';
import * as orderService from '../services/orderService.js';
import db from '../config/db.js';

/**
 * Updates the current GPS location of a driver for a specific order.
 *
 * @param {import('express').Request} req - Express request object containing orderId in params and lat/lng in body.
 * @param {import('express').Response} res - Express response object.
 */
export async function updateLocation(req, res) {
  try {
    const {orderId} = req.params;
    const {latitude, longitude} = req.body;

    const result = await deliveryService.createTrackingPoint(orderId, {
      latitude,
      longitude,
    });

    res.status(201).json({success: true, data: result});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
}

/**
 * Retrieves active deliveries assigned to the authenticated driver.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getMyActiveDeliveries(req, res) {
  try {
    const driverId = req.user.user_id;
    const [orders] = await db.execute(
      `SELECT
        order_id AS id,
        CONCAT('Asiakas #', customer_id) AS store,
        delivery_address AS address,
        status,
        notes AS contact,
        DATE_FORMAT(ordered_at, '%H:%i') AS eta,
        10 AS boxes
       FROM orders
       WHERE driver_id = ? AND status != 'done'`,
      [driverId]
    );

    res.json(orders);
  } catch (error) {
    console.error('Virhe tilausten haussa:', error);
    res.status(500).json({message: 'Virhe tilausten haussa'});
  }
}

/**
 * Retrieves live tracking data for a specific order (Customer view).
 * Verifies that the order belongs to the requesting customer.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getTrackingData(req, res) {
  const {orderId} = req.params;
  const customerId = req.user.user_id;

  try {
    const order = await orderService.getOrderById(orderId);

    if (!order || Number(order.customer_id) !== Number(customerId)) {
      return res
        .status(404)
        .json({error: 'Tilausta ei löydy tai se ei kuulu sinulle'});
    }

    const driverLocation = await deliveryService.getLatestLocation(orderId);

    const lat = driverLocation != null ? Number(driverLocation.lat) : NaN;
    const lng = driverLocation != null ? Number(driverLocation.lng) : NaN;

    const normalizedDriver =
      driverLocation && !Number.isNaN(lat) && !Number.isNaN(lng)
        ? {
            lat,
            lng,
            latitude: lat,
            longitude: lng,
            updated_at: driverLocation.updated_at,
          }
        : null;

    const destLat = order.latitude != null ? Number(order.latitude) : 0;
    const destLng = order.longitude != null ? Number(order.longitude) : 0;

    res.json({
      status: order.status,
      destination: {
        lat: Number.isFinite(destLat) ? destLat : 0,
        lng: Number.isFinite(destLng) ? destLng : 0,
      },
      driver: normalizedDriver,
    });
  } catch (error) {
    console.error('Tracking haku kaatui:', error);
    res.status(500).json({error: error.message});
  }
}

/**
 * Retrieves all active driver locations for the admin map.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getAllActiveLocations(req, res) {
  try {
    const locations = await deliveryService.getAllActiveLocations();
    res.json({success: true, data: locations});
  } catch (error) {
    console.error('Kaikkien sijaintien haku epäonnistui:', error);
    res.status(500).json({success: false, message: error.message});
  }
}

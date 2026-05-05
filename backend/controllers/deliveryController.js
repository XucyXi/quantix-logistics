// backend/controllers/deliveryController.js

const deliveryService = require('../services/deliveryService');
const orderService = require('../services/orderService');
const db = require('../config/db'); // Lisätty tämä, koska käytit getMyActiveDeliveries -funktiossa db.querya

exports.updateLocation = async (req, res) => {
  // console.log('Body:', req.body);
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
};

exports.getMyActiveDeliveries = async (req, res) => {
  try {
    const driverId = req.user.user_id;
    const [orders] = await db.execute(
      // Muutettu query -> execute, ja puretaan taulukosta
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
};

exports.getTrackingData = async (req, res) => {
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

    const lat =
      driverLocation != null ? Number(driverLocation.lat) : NaN;
    const lng =
      driverLocation != null ? Number(driverLocation.lng) : NaN;

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

    const destLat =
      order.latitude != null ? Number(order.latitude) : 0;
    const destLng =
      order.longitude != null ? Number(order.longitude) : 0;

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
};

exports.getAllActiveLocations = async (req, res) => {
  try {
    const locations = await deliveryService.getAllActiveLocations();
    res.json({success: true, data: locations});
  } catch (error) {
    console.error('Kaikkien sijaintien haku epäonnistui:', error);
    res.status(500).json({success: false, message: error.message});
  }
};

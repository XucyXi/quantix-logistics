const deliveryService = require('../services/deliveryService');
const orderService = require('../services/orderService');

exports.updateLocation = async (req, res) => {
  console.log('Body:', req.body);
  try {
    const {orderId} = req.params;
    const {latitude, longitude, status} = req.body;

    const result = await deliveryService.createTrackingPoint(orderId, {
      latitude,
      longitude,
      status,
    });

    res.status(201).json({success: true, data: result});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

exports.getMyActiveDeliveries = async (req, res) => {
  try {
    const driverId = req.user.user_id;
    const orders = await db.query(
      `SELECT
    order_id AS id,
    'Asiakas #' || customer_id AS store,
    delivery_address AS address,
    status,
    notes AS contact,
    DATE_FORMAT(scheduled_delivery, '%H:%i') AS eta,
    10 AS boxes
   FROM orders
   WHERE driver_id = ? AND status != 'done'`,
      [driverId]
    );

    res.json(orders);
  } catch (error) {
    res.status(500).json({message: 'Virhe tilausten haussa'});
  }
};

exports.getTrackingData = async (req, res) => {
  const {orderId} = req.params;
  const customerId = req.user.user_id;
  console.log('orderID', orderId);

  try {
    const orders = await orderService.getOrdersByCustomerId(customerId);
    console.log('orders', orders);
    const currentOrder = orders.find((o) => o.order_id == orderId);
    if (!currentOrder) {
      return res.status(404).json({error: 'Order not found'});
    }

    const driverLocation = await deliveryService.getLatestLocation(orderId);
    console.log('Sending to front:', driverLocation);
    res.json(driverLocation);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

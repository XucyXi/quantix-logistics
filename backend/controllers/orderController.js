const orderService = require('../services/orderService.js');
const {getCoords} = require('../utils/geocoder');
const db = require('../config/db');

async function createOrder(req, res) {
  try {
    const customerId = req.user.user_id;
    const result = await orderService.createOrder(customerId, req.body);

    res.status(201).json(result);
  } catch (err) {
    console.error('Controller error:', err.message);

    res.status(500).json({
      error: err.message || 'Failed to create order',
    });
  }
}

async function getOrder(req, res) {
  try {
    const {id} = req.params;

    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({error: 'Order not found'});
    }

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err.message);

    res.status(500).json({
      error: err.message || 'Failed to fetch order',
    });
  }
}

async function getAssignedOrders(req, res) {
  try {
    const driverId = req.user.user_id;

    const orders = await orderService.getAssignedOrders(driverId);

    for (let order of orders) {
      if (!order.latitude || !order.longitude) {
        const coords = await getCoords(order.delivery_address);
        if (coords) {
          await db.execute(
            'UPDATE ORDERS SET latitude = ?, longitude = ? WHERE order_id = ?',
            [coords.lat, coords.lon, order.order_id]
          );
          order.latitude = coords.lat;
          order.longitude = coords.lon;
        }
      }
    }
    res.json(orders);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || 'Failed to fetch assigned orders',
    });
  }
}

async function assignDriverToOrder(req, res) {
  try {
    const orderId = req.params.id;

    const result = await orderService.assignDriverToOrder(orderId);

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || 'Failed to assign driver',
    });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const orderId = req.params.id;
    const driverId = req.user.user_id;
    const {newStatus} = req.body;

    const result = await orderService.updateOrderStatus(
      orderId,
      driverId,
      newStatus
    );

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(400).json({
      error: err.message || 'Failed to update order status',
    });
  }
}

module.exports = {
  createOrder,
  getOrder,
  getAssignedOrders,
  assignDriverToOrder,
  updateOrderStatus,
};

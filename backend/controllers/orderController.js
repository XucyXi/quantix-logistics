const orderService = require('../services/orderService.js');
const {getCoords} = require('../utils/geocoder.js');
const db = require('../config/db.js');
const notificationService = require('../services/notificationService.js');

async function createOrder(req, res) {
  try {
    const customerId = req.user.user_id;
    const result = await orderService.createOrder(customerId, req.body);

    // Fetch user details for notifications
    const [userRows] = await db.query(
      'SELECT email, full_name FROM USERS WHERE user_id = ?',
      [customerId]
    );
    if (userRows.length === 0) {
      throw new Error('User not found');
    }
    const userDetails = {email: userRows[0].email, name: userRows[0].full_name};

    // Notifications
    const orderForNtf = {
      order_id: result.order_id,
      customer_id: customerId,
      total_price: result.total_price,
      delivery_address: req.body.delivery_address,
    };
    await notificationService.notifyOrderCreated(orderForNtf, userDetails);
    await notificationService.notifyAdminNewOrder(
      orderForNtf,
      req.body.items.length
    );

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

    // Notification
    if (result.driver_id) {
      const order = await orderService.getOrderById(orderId);
      const [users] = await db.query(
        'SELECT email, name, phone FROM USERS WHERE user_id = ?',
        [result.driver_id]
      );
      if (users.length > 0) {
        const driverDetails = users[0];
        await notificationService.notifyDriverAssignment(
          result.driver_id,
          order,
          driverDetails
        );
      }
    }

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

    // Notification
    if (result.status) {
      const order = await orderService.getOrderById(orderId);
      if (order && order.customer_id) {
        const [users] = await db.query(
          'SELECT email, name, phone FROM USERS WHERE user_id = ?',
          [order.customer_id]
        );
        if (users.length > 0) {
          await notificationService.notifyOrderStatusChange(
            order,
            newStatus,
            users[0]
          );
        }
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(400).json({
      error: err.message || 'Failed to update order status',
    });
  }
}

const getOrderStats = async (req, res) => {
  const customerId = req.user.user_id;
  try {
    const stats = await orderService.getOrderStats(customerId);
    res.json(stats);
  } catch (error) {
    console.error('Controller error getting stats:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to fetch order stats',
    });
  }
};

const getCustomerOrders = async (req, res) => {
  const customerId = req.user.user_id;

  // Luetaan sivutus- ja filtteriparametrit query stringistä
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const status = req.query.status || null;

  try {
    const orders = await orderService.getOrdersByCustomerId(
      customerId,
      limit,
      offset,
      status
    );
    res.json({success: true, orders});
  } catch (error) {
    console.error('Controller error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to fetch customer orders',
    });
  }
};

async function updateAvailability(req, res) {
  try {
    const driverId = req.user.user_id; // Extracted from authMiddleware
    const {active} = req.body;

    const success = await orderService.setDriverAvailability(driverId, active);
    if (!success) {
      return res
        .status(404)
        .json({success: false, message: 'Driver not found'});
    }

    return res.json({success: true, message: 'Availability updated'});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

async function cancelOrder(req, res) {
  try {
    const {id} = req.params;
    const success = await orderService.cancelOrder(id);

    if (!success) {
      return res.status(404).json({success: false, message: 'Order not found'});
    }

    return res.json({success: true, message: 'Order cancelled successfully'});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

async function getAllDrivers(req, res) {
  try {
    const drivers = await orderService.getAllDrivers();
    return res.json({success: true, drivers});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

async function getOrdersCursor(req, res) {
  try {
    const cursor = req.query.cursor || 0;
    const limit = req.query.limit || 20;

    const result = await orderService.getOrdersCursor(cursor, limit);
    return res.json({success: true, ...result});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

module.exports = {
  createOrder,
  getOrder,
  getAssignedOrders,
  assignDriverToOrder,
  updateOrderStatus,
  getOrderStats,
  getCustomerOrders,
  updateAvailability,
  cancelOrder,
  getAllDrivers,
  getOrdersCursor,
};

const orderService = require('../services/orderService.js');
const {getCoords} = require('../utils/geocoder.js');
const db = require('../config/db.js');
const notificationService = require('../services/notificationService.js');

async function createOrder(req, res) {
  try {
    const customerId = req.user.user_id;
    const result = await orderService.createOrder(customerId, req.body);

    // Notifications
    const orderForNtf = {
      order_id: result.order_id,
      customer_id: customerId,
      total_price: result.total_price,
      delivery_address: req.body.delivery_address,
    };

    // async function createOrder(customerId, payload) { const { delivery_address, notes, items } = payload;
    /*
      return {
    order_id: orderId,
    total_price: totalPrice,
    coords: { lat, lng }
  };
    */

    const userDetails = {email: req.user.email, name: req.user.name}; // Assuming req.user has these (UPDATE - Make sure authService + authController has these 2.5.10.40)
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
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        error: 'driverId is required'
      });
    }


    const result = await orderService.assignDriverToOrder(orderId, driverId);

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

async function updateAvailability(req, res) {
  try {
    const driverId = req.user.user_id;
    const { active } = req.body;
    console.log(typeof active)

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        error: 'active must be boolean'
      });
    }

    const result = await orderService.setDriverAvailability(driverId, active);

    res.json(result);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
}

async function cancelOrder(req, res) {
  try {
    const orderId = req.params.id;

    const result = await orderService.cancelOrder(orderId);

    res.json(result);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
}  


async function getAllDrivers(req, res) {
  try {
    // role check (critical)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: admin only'
      });
    }

    const drivers = await orderService.getAllDrivers();

    res.json(drivers);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || 'Failed to fetch drivers'
    });
  }
}


async function getOrdersCursor(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: admin only'
      });
    }

    const cursor = Number(req.query.cursor || 0);

    const result = await orderService.getOrdersCursor(cursor);

    res.json(result);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || 'Failed to fetch orders'
    });
  }
}

async function getCustomerOrders(req, res) {
  try {
    const customerId = req.user.user_id;
    
    // Turvallisempi muunnos, joka ei tee "undefined"-tekstistä NaN-arvoa
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit)) limit = 20;

    let offset = parseInt(req.query.offset, 10);
    if (isNaN(offset)) offset = 0;

    // Varmistetaan, ettei myöskään status-kenttään jää tekstiä "undefined"
    let status = req.query.status;
    if (status === 'undefined' || status === 'null' || status === '') {
      status = undefined;
    }

    const orders = await orderService.getOrdersByCustomerId(customerId, {
      limit,
      offset,
      status,
    });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error.message,
    });
  }
}


const getRevenueStats = async (req, res) => {
  try {
    const stats = await orderService.getGlobalRevenueStats();
    return res.json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue stats',
      error: error.message,
    });
  }
};

const getCustomerStats = async (req, res) => {
  try {
    const customerId = req.params.id;
    const stats = await orderService.getOrderStatsByCustomer(customerId);
    return res.json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer stats',
      error: error.message,
    });
  }
};


module.exports = {
  createOrder,
  getOrder,
  getAssignedOrders,
  assignDriverToOrder,
  updateOrderStatus,
  updateAvailability,
  cancelOrder,
  getAllDrivers,
  getOrdersCursor,
  getCustomerOrders,
  getRevenueStats,
  getCustomerStats
};

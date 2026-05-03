const orderService = require('../services/orderService.js');
const notificationService = require('../services/notificationService.js');
const db = require('../config/db.js');

async function createOrder(req, res) {
  try {
    const customerId = req.user.user_id;
    const {delivery_address, notes, items} = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({error: 'No items in order'});
    }

    const result = await orderService.createOrder(
      customerId,
      delivery_address,
      notes,
      items
    );

    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating order:', err);
    if (err.message.includes('ei ole tarpeeksi varastossa')) {
      return res.status(400).json({error: err.message});
    }
    res.status(500).json({error: 'Failed to create order'});
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
    res.status(500).json({error: err.message || 'Failed to fetch order'});
  }
}

async function getAssignedOrders(req, res) {
  try {
    const driverId = req.user.user_id;
    const orders = await orderService.getAssignedOrders(driverId);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching assigned orders:', err);
    res
      .status(500)
      .json({error: err.message || 'Failed to fetch assigned orders'});
  }
}

async function assignDriver(req, res) {
  try {
    const {id} = req.params;
    const {driver_id} = req.body;

    const newStatus = driver_id ? 'assigned' : 'pending';
    const updated = await orderService.assignDriver(id, driver_id, newStatus);

    if (!updated) {
      return res.status(404).json({error: 'Order not found'});
    }

    // Notifikaatio kuskille (Jos driver_id annettu)
    if (driver_id) {
      try {
        const order = await orderService.getOrderById(id);
        // Haetaan full_name AS name. Poistettu tästä phone, koska sitä ei edes ole USERS-taulussa.
        const [users] = await db.query(
          'SELECT email, full_name AS name FROM USERS WHERE user_id = ?',
          [driver_id]
        );
        if (users.length > 0) {
          await notificationService.notifyDriverAssignment(
            driver_id,
            order,
            users[0]
          );
        }
      } catch (notifErr) {
        console.error('Notification failed:', notifErr);
      }
    }

    // Automaattinen varastosimulaatio (Jos siirtyi tilaan 'assigned')
    if (newStatus === 'assigned') {
      setTimeout(async () => {
        try {
          await orderService.updateOrderStatus(id, 'in_progress');
          console.log(
            `[Auto-Varasto] Tilaus ${id} tilaan 'in_progress' (Keräilyssä)`
          );

          setTimeout(async () => {
            await orderService.updateOrderStatus(id, 'ready_for_pickup');
            console.log(
              `[Auto-Varasto] Tilaus ${id} tilaan 'ready_for_pickup' (Odottaa noutoa)`
            );
          }, 5000);
        } catch (err) {
          console.error('Varastosimulaatio epäonnistui:', err);
        }
      }, 5000);
    }

    res.json({message: 'Driver assigned successfully', status: newStatus});
  } catch (err) {
    console.error('Error assigning driver:', err);
    res.status(500).json({error: 'Failed to assign driver'});
  }
}

async function updateOrderStatus(req, res) {
  try {
    const orderId = req.params.id;
    const {newStatus} = req.body;

    const success = await orderService.updateOrderStatus(orderId, newStatus);
    if (!success) {
      return res.status(404).json({error: 'Order not found'});
    }

    // Notifikaatio asiakkaalle
    try {
      const order = await orderService.getOrderById(orderId);
      if (order && order.customer_id) {
        // KORJATTU: Haetaan full_name AS name. Poistettu phone.
        const [users] = await db.query(
          'SELECT email, full_name AS name FROM USERS WHERE user_id = ?',
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
    } catch (notifErr) {
      console.error('Notification failed:', notifErr);
    }

    res.json({success: true, status: newStatus});
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({error: err.message || 'Failed to update order status'});
  }
}

const getOrderStats = async (req, res) => {
  const customerId = req.user.user_id;
  try {
    const stats = await orderService.getOrderStats(customerId);
    res.json(stats);
  } catch (error) {
    console.error('Controller error getting stats:', error.message);
    res
      .status(500)
      .json({error: error.message || 'Failed to fetch order stats'});
  }
};

const getCustomerOrders = async (req, res) => {
  const customerId = req.user.user_id;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const status = req.query.status || null;

  try {
    const orders = await orderService.getOrdersByCustomerId(customerId, {
      limit,
      offset,
      status,
    });
    res.json({success: true, orders});
  } catch (error) {
    console.error('Controller error:', error.message);
    res
      .status(500)
      .json({error: error.message || 'Failed to fetch customer orders'});
  }
};

async function updateAvailability(req, res) {
  try {
    const driverId = req.user.user_id;
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
    const result = await orderService.cancelOrder(id);

    if (!result) {
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

async function getAllOrdersAdmin(req, res) {
  try {
    const orders = await orderService.getAllOrdersAdmin();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({error: 'Failed to fetch admin orders'});
  }
}

module.exports = {
  createOrder,
  getOrder,
  getAssignedOrders,
  updateOrderStatus,
  getOrderStats,
  getCustomerOrders,
  updateAvailability,
  cancelOrder,
  getAllDrivers,
  getOrdersCursor,
  getAllOrdersAdmin,
  assignDriver,
};

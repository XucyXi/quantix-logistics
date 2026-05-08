/**
 * @fileoverview Order Controller.
 * Handles the full lifecycle of orders, driver assignments, and automated warehouse simulation.
 */

import * as orderService from '../services/orderService.js';
import * as notificationService from '../services/notificationService.js';
import db from '../config/db.js';

/**
 * Creates a new order for the authenticated customer.
 *
 * @param {import('express').Request} req - Express request object containing delivery_address, notes, and items array.
 * @param {import('express').Response} res - Express response object.
 */
export async function createOrder(req, res) {
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
    if (err.message.includes('ei ole tarpeeksi varastossa')) {
      return res.status(400).json({error: err.message});
    }
    res.status(500).json({error: 'Failed to create order'});
  }
}

/**
 * Fetches a single order by its ID.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getOrder(req, res) {
  try {
    const {id} = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({error: 'Order not found'});
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({error: err.message || 'Failed to fetch order'});
  }
}

/**
 * Fetches all active orders assigned to the authenticated driver.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getAssignedOrders(req, res) {
  try {
    const driverId = req.user.user_id;
    const orders = await orderService.getAssignedOrders(driverId);
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({error: err.message || 'Failed to fetch assigned orders'});
  }
}

/**
 * Assigns a driver to an order.
 * If a driver is assigned, triggers an automated warehouse simulation that
 * changes the order status to 'in_progress' and then 'ready_for_pickup'.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function assignDriver(req, res) {
  try {
    const {id} = req.params;
    const {driver_id} = req.body;

    const newStatus = driver_id ? 'assigned' : 'pending';
    const updated = await orderService.assignDriver(id, driver_id, newStatus);

    if (!updated) {
      return res.status(404).json({error: 'Order not found'});
    }

    if (driver_id) {
      try {
        const order = await orderService.getOrderById(id);
        const [users] = await db.query(
          'SELECT email, full_name AS name FROM users WHERE user_id = ?',
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

    // Automatic warehouse simulation logic
    if (newStatus === 'assigned') {
      setTimeout(async () => {
        try {
          await orderService.updateOrderStatus(id, 'in_progress');
          setTimeout(async () => {
            await orderService.updateOrderStatus(id, 'ready_for_pickup');
          }, 5000);
        } catch (err) {
          console.error('Warehouse simulation failed:', err);
        }
      }, 5000);
    }

    res.json({message: 'Driver assigned successfully', status: newStatus});
  } catch (err) {
    res.status(500).json({error: 'Failed to assign driver'});
  }
}

/**
 * Updates the status of an order and notifies the customer.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function updateOrderStatus(req, res) {
  try {
    const orderId = req.params.id;
    const {newStatus} = req.body;

    const success = await orderService.updateOrderStatus(orderId, newStatus);
    if (!success) {
      return res.status(404).json({error: 'Order not found'});
    }

    try {
      const order = await orderService.getOrderById(orderId);
      if (order && order.customer_id) {
        const [users] = await db.query(
          'SELECT email, full_name AS name FROM users WHERE user_id = ?',
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
    res
      .status(400)
      .json({error: err.message || 'Failed to update order status'});
  }
}

/**
 * Fetches aggregate order statistics for the authenticated customer.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getOrderStats(req, res) {
  const customerId = req.user.user_id;
  try {
    const stats = await orderService.getOrderStats(customerId);
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({error: error.message || 'Failed to fetch order stats'});
  }
}

/**
 * Fetches paginated orders for the authenticated customer.
 *
 * @param {import('express').Request} req - Express request object containing limit, offset, and status filters.
 * @param {import('express').Response} res - Express response object.
 */
export async function getCustomerOrders(req, res) {
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
    res
      .status(500)
      .json({error: error.message || 'Failed to fetch customer orders'});
  }
}

/**
 * Updates the 'active' status of the authenticated driver.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function updateAvailability(req, res) {
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

/**
 * Cancels a pending order and restores product stock.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function cancelOrder(req, res) {
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

/**
 * Fetches all drivers in the system (Admin only).
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getAllDrivers(req, res) {
  try {
    const drivers = await orderService.getAllDrivers();
    return res.json({success: true, drivers});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

/**
 * Fetches orders using cursor-based pagination for efficient large-scale retrieval.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getOrdersCursor(req, res) {
  try {
    const cursor = req.query.cursor || 0;
    const limit = req.query.limit || 16;

    const result = await orderService.getOrdersCursor(cursor, limit);
    return res.json({success: true, ...result});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

/**
 * Fetches all orders for the admin dashboard.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getAllOrdersAdmin(req, res) {
  try {
    const orders = await orderService.getAllOrdersAdmin();
    res.json(orders);
  } catch (err) {
    res.status(500).json({error: 'Failed to fetch admin orders'});
  }
}

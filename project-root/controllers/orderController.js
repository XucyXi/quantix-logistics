const orderService = require('../services/orderService.js');

async function createOrder(req, res) {
    try {
      const customerId = req.user.user_id;
      const result = await orderService.createOrder(customerId, req.body);
  
      res.status(201).json(result);
  
    } catch (err) {
      console.error("Controller error:", err.message);
  
      res.status(500).json({
        error: err.message || "Failed to create order"
      });
    }
  }

  async function getOrder(req, res) {
    try {
      const { id } = req.params;
  
      const order = await orderService.getOrderById(id);
  
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      res.json(order);
  
    } catch (err) {
      console.error("Get order error:", err.message);
  
      res.status(500).json({
        error: err.message || "Failed to fetch order"
      });
    }
  }

async function getAssignedOrders(req, res) {
    try {
      const driverId = req.user.user_id;

      console.log("CONTROLLER driverId:", driverId);    
  
      const orders = await orderService.getAssignedOrders(driverId);
  
      res.json(orders);
  
    } catch (err) {
      console.error(err);
  
      res.status(500).json({
        error: err.message || 'Failed to fetch assigned orders'
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
  
      res.json(result);
  
    } catch (err) {
      console.error(err);
  
      res.status(400).json({
        error: err.message || 'Failed to assign driver'
      });
    }
  }
  
  
  async function updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const driverId = req.user.user_id;
      const { newStatus } = req.body;
  
      const result = await orderService.updateOrderStatus(
        orderId,
        driverId,
        newStatus
      );
  
      res.json(result);
  
    } catch (err) {
      console.error(err);
  
      res.status(400).json({
        error: err.message || 'Failed to update order status'
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

// backend/controllers/orderController.js
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
    getCustomerOrders
}

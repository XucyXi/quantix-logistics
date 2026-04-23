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
  
  

module.exports = {
    createOrder,
    getOrder
}

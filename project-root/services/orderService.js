const pool = require('../config/db');
const productModel = require("../services/productsService.js");


async function createOrder(customerId, payload) {
  const {
    delivery_address,
    notes,
    scheduled_delivery,
    items
  } = payload;

  if (!items || items.length === 0) {
    throw new Error("Items are required");
  }

  let totalPrice = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = await productModel.getProductById(item.product_id);

    if (!product) {
      throw new Error(`Product ${item.product_id} not found`);
    }

    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const unitPrice = product.base_price;
    const itemTotal = unitPrice * item.quantity;

    totalPrice += itemTotal;

    enrichedItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice
    });
  }

  const orderData = {
    customer_id: customerId,
    delivery_address,
    notes,
    scheduled_delivery,
    total_price: totalPrice
  };

  const orderId = await createOrderWithItems(orderData, enrichedItems);

  return {
    order_id: orderId,
    total_price: totalPrice
  };
}


async function createOrderWithItems(orderData, items) {
    const connection = await pool.getConnection();
  
    try {
      await connection.beginTransaction();
  
      // Insert order
      const [orderResult] = await connection.query(
        `INSERT INTO ORDERS
         (customer_id, delivery_address, notes, scheduled_delivery, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderData.customer_id,
          orderData.delivery_address,
          orderData.notes || null,
          orderData.scheduled_delivery || null,
          orderData.total_price
        ]
      );
  
      const orderId = orderResult.insertId;
  
      // Insert items
      const itemValues = items.map(item => [
        orderId,
        item.product_id,
        item.quantity,
        item.unit_price
      ]);
  
      await connection.query(
        `INSERT INTO ORDER_ITEMS
         (order_id, product_id, quantity, unit_price)
         VALUES ?`,
        [itemValues]
      );
  
      await connection.commit();
  
      return orderId;
  
    } catch (err) {
      await connection.rollback();
      console.error("DB Transaction error:", err);
      throw err;
    } finally {
      connection.release();
    }
  }

async function getOrderById(orderId) {
const [orders] = await pool.query(
    `SELECT * FROM ORDERS WHERE order_id = ?`,
    [orderId]
);

if (!orders.length) return null;

const order = orders[0];

const [items] = await pool.query(
    `SELECT * FROM ORDER_ITEMS WHERE order_id = ?`,
    [orderId]
);

order.items = items;

return order;
}
  

module.exports = {
createOrder,
// insertOrderItems,
// createOrderWithItems,
getOrderById
};

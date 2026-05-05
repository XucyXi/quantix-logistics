/**
 * @fileoverview Order Service.
 * Core business logic for handling orders. Employs MySQL transactions and row-level
 * locking (FOR UPDATE) to prevent race conditions in inventory management.
 */

import pool from '../config/db.js';
import getCoords from '../utils/geocoder.js';

/**
 * Creates a new order using a database transaction.
 * Validates stock, calculates prices, and triggers geocoding for the delivery address.
 *
 * @param {number|string} customerId
 * @param {string} deliveryAddress
 * @param {string} notes
 * @param {Array} items
 * @returns {Promise<Object>} The created order details.
 */
export async function createOrder(customerId, deliveryAddress, notes, items) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let totalPrice = 0;

    // TARKISTETAAN SALDOT JA LASKETAAN KOKONAISHINTA
    // 'FOR UPDATE' lukitsee tuoterivin transaktion ajaksi, estäen päällekkäiset ostot
    for (const item of items) {
      const [productRows] = await connection.query(
        `SELECT base_price, stock_quantity, name FROM PRODUCTS WHERE product_id = ? FOR UPDATE`,
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Tuotetta ID:llä ${item.product_id} ei löytynyt.`);
      }

      const product = productRows[0];
      if (product.stock_quantity < item.quantity) {
        throw new Error(
          `Tuotetta "${product.name}" ei ole tarpeeksi varastossa. Jäljellä: ${product.stock_quantity} kpl.`
        );
      }

      totalPrice += parseFloat(product.base_price) * item.quantity;
    }

    // HAETAAN KOORDINAATIT (Geocoding)
    let lat = null;
    let lng = null;
    try {
      const coords = await getCoords(deliveryAddress);
      if (coords) {
        lat = coords.lat;
        lng = coords.lon;
      }
    } catch (err) {
      console.error('Geocoding failed during order creation:', err);
    }

    // LUODAAN TILAUS
    const [orderRes] = await connection.query(
      `INSERT INTO ORDERS (customer_id, delivery_address, notes, total_price, status, latitude, longitude)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [customerId, deliveryAddress, notes, totalPrice, lat, lng]
    );
    const orderId = orderRes.insertId;

    // LISÄTÄÄN TUOTTEET TILAUKSEEN JA VÄHENNETÄÄN VARASTOSALDO
    for (const item of items) {
      const [pRows] = await connection.query(
        `SELECT base_price FROM PRODUCTS WHERE product_id = ?`,
        [item.product_id]
      );

      await connection.query(
        `INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, pRows[0].base_price]
      );

      await connection.query(
        `UPDATE PRODUCTS SET stock_quantity = stock_quantity - ? WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // LUODAAN TRACKING-RIVI LIVE-KARTTAA VARTEN
    await connection.query(
      `INSERT INTO DELIVERY_TRACKING (order_id, latitude, longitude) VALUES (?, ?, ?)`,
      [orderId, lat, lng]
    );

    await connection.commit();
    return {order_id: orderId, total_price: totalPrice, coords: {lat, lng}};
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Retrieves a single order and its associated items.
 */
export async function getOrderById(orderId) {
  const [orders] = await pool.query(`SELECT * FROM ORDERS WHERE order_id = ?`, [
    orderId,
  ]);
  if (!orders.length) return null;

  const order = orders[0];
  const [items] = await pool.query(
    `SELECT * FROM ORDER_ITEMS WHERE order_id = ?`,
    [orderId]
  );
  order.items = items;

  return order;
}

/**
 * Retrieves all orders for the admin dashboard.
 */
export async function getAllOrdersAdmin() {
  const query = `
    SELECT
      o.order_id, o.status, o.delivery_address, o.notes, o.ordered_at, o.total_price, o.driver_id,
      cu.full_name AS customerName, dr.full_name AS driverName,
      COALESCE(SUM(oi.quantity), 0) AS items_count
    FROM ORDERS o
    LEFT JOIN USERS cu ON o.customer_id = cu.user_id
    LEFT JOIN USERS dr ON o.driver_id = dr.user_id
    LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
    GROUP BY o.order_id
    ORDER BY o.ordered_at DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
}

/**
 * Assigns a driver to an order.
 */
export async function assignDriver(orderId, driverId, newStatus) {
  const [result] = await pool.query(
    `UPDATE ORDERS SET driver_id = ?, status = ? WHERE order_id = ?`,
    [driverId, newStatus, orderId]
  );
  return result.affectedRows > 0;
}

/**
 * Updates the current status of an order.
 */
export async function updateOrderStatus(orderId, status) {
  const [result] = await pool.query(
    `UPDATE ORDERS SET status = ? WHERE order_id = ?`,
    [status, orderId]
  );
  return result.affectedRows > 0;
}

/**
 * Cancels an order, restoring stock quantities and freeing up the driver's capacity.
 */
export async function cancelOrder(orderId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[order]] = await connection.query(
      `SELECT status, driver_id FROM ORDERS WHERE order_id = ? FOR UPDATE`,
      [orderId]
    );

    if (!order) throw new Error('Order not found');
    if (order.status === 'done')
      throw new Error('Cannot cancel completed order');
    if (order.status === 'cancelled')
      throw new Error('Order is already cancelled');

    // Palauta varastosaldo
    const [items] = await connection.query(
      `SELECT product_id, quantity FROM ORDER_ITEMS WHERE order_id = ?`,
      [orderId]
    );

    for (const item of items) {
      await connection.query(
        `UPDATE PRODUCTS SET stock_quantity = stock_quantity + ? WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }

    if (order.driver_id) {
      await connection.query(
        `UPDATE DRIVER_PROFILES SET current_orders = GREATEST(current_orders - 1, 0) WHERE user_id = ?`,
        [order.driver_id]
      );
    }

    await connection.query(
      `UPDATE ORDERS SET status = 'cancelled' WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit();
    return {order_id: orderId, status: 'cancelled'};
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

const ACTIVE_STATUSES = [
  'assigned',
  'in_progress',
  'ready_for_pickup',
  'in_transit',
  'pending',
];

/**
 * Retrieves all active orders assigned to a specific driver.
 */
export async function getAssignedOrders(driverId) {
  if (!driverId) throw new Error('Driver ID is required');

  const statusPlaceholders = ACTIVE_STATUSES.map(() => '?').join(',');
  const [rows] = await pool.query(
    `
    SELECT
      o.order_id, o.status, o.delivery_address, o.notes, o.ordered_at, o.latitude, o.longitude,
      cp.company_name, cp.address AS customer_address, cp.tel AS customer_tel,
      dp.vehicle_info, dp.active AS driver_active,
      oi.product_id, oi.quantity, oi.unit_price, p.name AS product_name
    FROM ORDERS o
    LEFT JOIN CUSTOMER_PROFILES cp ON o.customer_id = cp.user_id
    LEFT JOIN DRIVER_PROFILES dp ON o.driver_id = dp.user_id
    LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
    LEFT JOIN PRODUCTS p ON oi.product_id = p.product_id
    WHERE o.driver_id = ? AND o.status IN (${statusPlaceholders})
    ORDER BY o.order_id;
    `,
    [driverId, ...ACTIVE_STATUSES]
  );

  if (!rows.length) return [];

  const ordersMap = {};
  for (const row of rows) {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        order_id: row.order_id,
        status: row.status,
        delivery_address: row.delivery_address,
        notes: row.notes,
        latitude: row.latitude != null ? Number(row.latitude) : null,
        longitude: row.longitude != null ? Number(row.longitude) : null,
        customer: {company_name: row.company_name, tel: row.customer_tel},
        items: [],
      };
    }
    if (row.product_id) {
      ordersMap[row.order_id].items.push({
        name: row.product_name,
        quantity: row.quantity,
      });
    }
  }

  return Object.values(ordersMap);
}

/**
 * Retrieves paginated orders for a specific customer.
 */
export async function getOrdersByCustomerId(
  customerId,
  {limit = 20, offset = 0, status = null} = {}
) {
  let query = `
    SELECT
      o.order_id, o.status, o.delivery_address, o.total_price, o.ordered_at,
      COUNT(oi.order_item_id) as item_count, u.email as driver_email
    FROM ORDERS o
    LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
    LEFT JOIN USERS u ON o.driver_id = u.user_id
    WHERE o.customer_id = ?`;

  const params = [customerId];
  if (status) {
    query += ` AND o.status = ?`;
    params.push(status);
  }

  query += ` GROUP BY o.order_id ORDER BY o.ordered_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [orders] = await pool.query(query, params);
  return orders;
}

/**
 * Retrieves aggregate order statistics for a specific customer.
 */
export async function getOrderStats(customerId) {
  if (!customerId) throw new Error('Customer ID is required');

  const [stats] = await pool.query(
    `
    SELECT
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as delivered_count,
      SUM(CASE WHEN status IN ('pending', 'assigned') THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status IN ('in_progress', 'in_transit') THEN 1 ELSE 0 END) as in_transit_count,
      COALESCE(SUM(total_price), 0) as total_spent,
      COALESCE(AVG(total_price), 0) as average_order_value,
      COALESCE(ROUND(AVG(DATEDIFF(CURDATE(), ordered_at)), 1), 0) as delivery_speed_days,
      COALESCE(ROUND(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1), 0) as success_rate
    FROM ORDERS
    WHERE customer_id = ?
    `,
    [customerId]
  );

  return (
    stats[0] || {
      total_orders: 0,
      delivered_count: 0,
      pending_count: 0,
      in_transit_count: 0,
      total_spent: 0,
      average_order_value: 0,
      delivery_speed_days: 0,
      success_rate: 0,
    }
  );
}

/**
 * Updates the 'active' status of a driver.
 */
export async function setDriverAvailability(driverId, isActive) {
  const [result] = await pool.query(
    `UPDATE DRIVER_PROFILES SET active = ? WHERE user_id = ?`,
    [isActive, driverId]
  );
  if (result.affectedRows === 0) throw new Error('Driver not found');
  return {driver_id: driverId, active: isActive};
}

/**
 * Retrieves a list of all drivers in the system.
 */
export async function getAllDrivers() {
  const [rows] = await pool.query(`
    SELECT
      dp.driver_id, dp.user_id, dp.vehicle_info, dp.active, dp.current_orders, dp.max_orders,
      u.full_name, u.email, u.created_at, u.last_login
    FROM DRIVER_PROFILES dp
    JOIN USERS u ON dp.user_id = u.user_id
    ORDER BY dp.driver_id DESC
  `);
  return rows;
}

// Helpers for Cursor Pagination
const normalizeCursor = (cursor) => {
  const parsed = Number(cursor);
  return !Number.isFinite(parsed) || parsed < 0 ? 0 : Math.floor(parsed);
};

const normalizeLimit = (limit, defaultLimit = 16, maxLimit = 16) => {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultLimit;
  return Math.min(Math.floor(parsed), maxLimit);
};

/**
 * Fetches orders using highly optimized cursor-based pagination.
 * Executes two separate queries (Orders, then Items via IN clause) to prevent
 * massive Cartesian products and data duplication over the network.
 */
export async function getOrdersCursor(rawCursor = 0, rawLimit = 16) {
  const cursor = normalizeCursor(rawCursor);
  const limit = normalizeLimit(rawLimit);

  try {
    const [orders] = await pool.query(
      `
      SELECT order_id, customer_id, driver_id, status, delivery_address, notes, ordered_at, total_price
      FROM ORDERS WHERE order_id > ? ORDER BY order_id ASC LIMIT ?
      `,
      [cursor, limit]
    );

    if (!orders.length) return {data: [], nextCursor: null};

    const orderIds = orders.map((o) => o.order_id);
    const [items] = await pool.query(
      `
      SELECT oi.order_id, oi.product_id, oi.quantity, oi.unit_price, p.name AS product_name
      FROM ORDER_ITEMS oi
      LEFT JOIN PRODUCTS p ON oi.product_id = p.product_id
      WHERE oi.order_id IN (?)
      `,
      [orderIds]
    );

    const ordersMap = new Map();
    for (const order of orders) {
      order.items = [];
      ordersMap.set(order.order_id, order);
    }

    for (const item of items) {
      const order = ordersMap.get(item.order_id);
      if (order) {
        order.items.push({
          product_id: item.product_id,
          name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        });
      }
    }

    const nextCursor =
      orders.length === limit ? orders[orders.length - 1].order_id : null;
    return {data: orders, nextCursor};
  } catch (err) {
    console.error('Database error in getOrdersCursor:', err);
    throw err;
  }
}

const pool = require('../config/db');
const productModel = require('../services/productsService.js');
const getCoords = require('../utils/geocoder.js');

async function createOrder(customerId, payload) {
  const {delivery_address, notes, scheduled_delivery, items} = payload;

  if (!items || items.length === 0) {
    throw new Error('Items are required');
  }

  let lat = null;
  let lng = null;
  try {
    const coords = await getCoords(delivery_address);
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  } catch (err) {
    console.error('Geocoding failed during order creation:', err);
  }

  let totalPrice = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = await productModel.getProductById(item.product_id);
    if (!product) {
      throw new Error(`Product ${item.product_id} not found`);
    }

    if (item.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const unitPrice = product.base_price;
    const itemTotal = unitPrice * item.quantity;

    totalPrice += itemTotal;

    enrichedItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice,
    });
  }

  const orderData = {
    customer_id: customerId,
    delivery_address,
    latitude: lat,
    longitude: lng,
    notes,
    scheduled_delivery,
    total_price: totalPrice,
  };

  const orderId = await createOrderWithItems(orderData, enrichedItems);

  return {
    order_id: orderId,
    total_price: totalPrice,
    coords: {lat, lng},
  };
}

async function createOrderWithItems(orderData, items) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO ORDERS
         (customer_id, delivery_address, latitude, longitude, notes, scheduled_delivery, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,

      [
        orderData.customer_id,
        orderData.delivery_address,
        orderData.latitude,
        orderData.longitude,
        orderData.notes || null,
        orderData.scheduled_delivery || null,
        orderData.total_price,
      ]
    );

    const orderId = orderResult.insertId;

    // Insert items
    const itemValues = items.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.unit_price,
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
    console.error('DB Transaction error:', err);
    throw err;
  } finally {
    connection.release();
  }
}

async function getOrderById(orderId) {
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

async function assignDriverToOrder(orderId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [drivers] = await connection.query(
      `
      SELECT dp.user_id
      FROM DRIVER_PROFILES dp
      JOIN USERS u ON dp.user_id = u.user_id
      WHERE dp.active = TRUE
        AND u.role = 'driver'
      LIMIT 1
      `
    );

    if (!drivers.length) {
      throw new Error('No available drivers');
    }

    const driverId = drivers[0].user_id;

    const [orderResult] = await connection.query(
      `
      UPDATE ORDERS
      SET driver_id = ?, status = 'assigned'
      WHERE order_id = ?
        AND driver_id IS NULL
      `,
      [driverId, orderId]
    );

    if (orderResult.affectedRows === 0) {
      throw new Error('Order not found or already assigned');
    }

    // Mark driver as inactive (USES idx_driver_active)
    await connection.query(
      `
      UPDATE DRIVER_PROFILES
      SET active = FALSE
      WHERE user_id = ?
      `,
      [driverId]
    );

    await connection.commit();

    return {
      order_id: orderId,
      driver_id: driverId,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateOrderStatus(orderId, driverId, newStatus) {
  const connection = await pool.getConnection();

  const validTransitions = {
    assigned: ['in_progress'],
    in_progress: ['in_transit', 'stuck'],
    in_transit: ['done'],
    done: [],
    stuck: [],
  };

  //  status ENUM('pending','assigned','in_progress','in_transit','done','stuck') DEFAULT 'pending',

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT status, driver_id
       FROM ORDERS
       WHERE order_id = ? AND driver_id = ?`,
      [orderId, driverId]
    );

    if (!orders.length) {
      throw new Error('Order not found or not assigned to this driver');
    }

    const order = orders[0];

    if (order.driver_id !== driverId) {
      throw new Error('Unauthorized: Not your order');
    }

    const expectedNext = validTransitions[order.status];

    if (!expectedNext.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${order.status} → ${newStatus}`
      );
    }

    await connection.query(`UPDATE ORDERS SET status = ? WHERE order_id = ?`, [
      newStatus,
      orderId,
    ]);

    if (newStatus === 'done') {
      await connection.query(
        `UPDATE DRIVER_PROFILES
         SET active = TRUE
         WHERE user_id = ?`,
        [driverId]
      );
    }

    await connection.commit();

    return {
      order_id: orderId,
      status: newStatus,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

const ACTIVE_STATUSES = ['assigned', 'done', 'ready_for_pickup', 'in_transit'];

async function getAssignedOrders(driverId) {
  if (!driverId) {
    throw new Error('Driver ID is required');
  }

  const [rows] = await pool.query(
    `
SELECT
  o.order_id,
  o.status,
  o.delivery_address,
  o.notes,
  o.ordered_at,
  o.scheduled_delivery,

  -- Customer info
  cp.company_name,
  cp.address AS customer_address,
  cp.tel AS customer_tel,

  -- Driver info
  dp.vehicle_info,
  dp.active AS driver_active,

  -- Items
  oi.product_id,
  oi.quantity,
  oi.unit_price,

  -- Product info
  p.name AS product_name

FROM ORDERS o

-- Customer profile
JOIN CUSTOMER_PROFILES cp
  ON o.customer_id = cp.user_id

-- Driver profile (Order might not be assigned yet)
LEFT JOIN DRIVER_PROFILES dp
  ON o.driver_id = dp.user_id

-- Order items
LEFT JOIN ORDER_ITEMS oi
  ON o.order_id = oi.order_id

-- Product info
LEFT JOIN PRODUCTS p
  ON oi.product_id = p.product_id

WHERE o.driver_id = ?
AND o.status IN (?, ?, ?, ?)

ORDER BY o.order_id;

    `,
    [driverId, ...ACTIVE_STATUSES]
  );

  // If nothing matches → empty array
  if (!rows.length) {
    return [];
  }

  return shapeOrders(rows);
}

function shapeOrders(rows) {
  const ordersMap = {};

  for (const row of rows) {
    // Create order if not exists
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        order_id: row.order_id,
        status: row.status,
        delivery_address: row.delivery_address,
        notes: row.notes,
        customer: {
          company_name: row.company_name,
          tel: row.tel,
        },
        items: [],
      };
    }

    // Skip null items (LEFT JOIN case)
    if (row.product_id) {
      ordersMap[row.order_id].items.push({
        name: row.product_name,
        quantity: row.quantity,
      });
    }
  }

  return Object.values(ordersMap);
}

const getOrdersByCustomerId = async (
  customerId,
  {limit = 20, offset = 0, status = null} = {}
) => {
  let query = `
    SELECT
      o.order_id,
      o.status,
      o.delivery_address,
      o.total_price,
      o.ordered_at,
      COUNT(oi.order_item_id) as item_count,
      u.email as driver_email
    FROM ORDERS o
    LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
    LEFT JOIN USERS u ON o.driver_id = u.user_id
    WHERE o.customer_id = ?`;

  const params = [customerId];

  if (status) {
    query += ` AND o.status = ?`;
    params.push(status);
  }

  // GROUP BY is required because of the COUNT() aggregate
  query += ` GROUP BY o.order_id ORDER BY o.ordered_at DESC LIMIT ? OFFSET ?`;

  // Using Number() casting for safety
  params.push(Number(limit), Number(offset));

  try {
    const [orders] = await pool.query(query, params);
    return orders;
  } catch (error) {
    console.error('Error in getOrdersByCustomerId service:', error);
    throw new Error('Could not fetch orders from database');
  }
};

async function getOrderStats(customerId) {
  if (!customerId) {
    throw new Error('Customer ID is required');
  }

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
      COALESCE(
        ROUND(
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0),
          1
        ),
        0
      ) as success_rate
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

async function setDriverAvailability(driverId, active) {
  const query = `UPDATE DRIVER_PROFILES SET active = ? WHERE user_id = ?`;
  const [result] = await pool.query(query, [active ? 1 : 0, driverId]);
  return result.affectedRows > 0;
}

async function cancelOrder(orderId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[order]] = await connection.query(
      `
        SELECT status, driver_id
        FROM ORDERS
        WHERE order_id = ?
        FOR UPDATE
        `,
      [orderId]
    );

    if (!order) throw new Error('Order not found');

    if (order.status === 'done') {
      throw new Error('Cannot cancel completed order');
    }

    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    // Restore stock
    const [items] = await connection.query(
      `
        SELECT product_id, quantity
        FROM ORDER_ITEMS
        WHERE order_id = ?
        `,
      [orderId]
    );

    for (const item of items) {
      await connection.query(
        `
          UPDATE PRODUCTS
          SET stock_quantity = stock_quantity + ?
          WHERE product_id = ?
          `,
        [item.quantity, item.product_id]
      );
    }

    // If driver assigned → decrement counter
    if (order.driver_id) {
      await connection.query(
        `
          UPDATE DRIVER_PROFILES
          SET current_orders = GREATEST(current_orders - 1, 0)
          WHERE user_id = ?
          `,
        [order.driver_id]
      );
    }

    // Mark as "cancelled"
    await connection.query(
      `
        UPDATE ORDERS
        SET status = 'cancelled'
        WHERE order_id = ?
        `,
      [orderId]
    );

    await connection.commit();

    invalidateOrderCache();

    return {
      order_id: orderId,
      status: 'cancelled',
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function getAllDrivers() {
  // Joins the USERS table with DRIVER_PROFILES to get the full picture
  const query = `
    SELECT u.user_id, u.full_name, u.email, d.active AS is_available 
    FROM USERS u
    JOIN DRIVER_PROFILES d ON u.user_id = d.user_id
    WHERE u.role = 'driver'
  `;
  const [rows] = await pool.query(query);
  return rows;
}

async function getOrdersCursor(cursor = 0, limit = 20) {
  // Cursor-based pagination (faster than OFFSET for large datasets)
  const query = `
    SELECT * FROM ORDERS 
    WHERE order_id > ? 
    ORDER BY order_id ASC 
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [Number(cursor), Number(limit)]);

  // Determine the next cursor
  const nextCursor = rows.length > 0 ? rows[rows.length - 1].order_id : null;

  return {data: rows, nextCursor};
}

module.exports = {
  createOrder,
  getOrderById,
  assignDriverToOrder,
  getAssignedOrders,
  updateOrderStatus,
  getOrdersByCustomerId,
  getOrderStats,
  setDriverAvailability,
  cancelOrder,
  getAllDrivers,
  getOrdersCursor,
};

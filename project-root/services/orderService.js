const pool = require('../config/db');
const productModel = require("../services/productsService.js");

const ACTIVE_STATUSES = ['assigned', 'in_progress', 'ready_for_pickup', 'in_transit'];

async function createOrder(customerId, payload) {
  const { delivery_address, notes, items } = payload;

  if (!items || items.length === 0) {
    throw new Error("Items are required");
  }

  // 1. Normalize / merge duplicate items
  const merged = {};
  for (const item of items) {
    if (!merged[item.product_id]) {
      merged[item.product_id] = 0;
    }
    merged[item.product_id] += item.quantity;
  }

  const normalizedItems = Object.entries(merged).map(
    ([product_id, quantity]) => ({
      product_id: Number(product_id),
      quantity
    })
  );

  // Fetch products once
  const [products] = await pool.query(
    `SELECT product_id, base_price
     FROM PRODUCTS
     WHERE product_id IN (?)`,
    [normalizedItems.map(i => i.product_id)]
  );

  const productMap = new Map(
    products.map(p => [p.product_id, p])
  );

  let totalPrice = 0;
  const enrichedItems = [];

  for (const item of normalizedItems) {
    const product = productMap.get(item.product_id);

    if (!product) {
      throw new Error(`Product ${item.product_id} not found`);
    }

    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity`);
    }

    totalPrice += Number(product.base_price) * item.quantity;

    enrichedItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: product.base_price
    });
  }

  const orderId = await createOrderWithItems({
    customer_id: customerId,
    delivery_address,
    notes,
    total_price: totalPrice
  }, enrichedItems);

  productModel.invalidateProductCache();
  invalidateOrderCache();

  return {
    order_id: orderId,
    total_price: totalPrice
  };
}

/*

async function createOrder(customerId, payload) {
  const {
    delivery_address,
    notes,
    items
  } = payload;

  if (!items || items.length === 0) {
    throw new Error("Items are required");  
  }

  let totalPrice = 0;
  const enrichedItems = [];

  const [products] = await pool.query(
    `SELECT product_id, base_price, stock_quantity
     FROM PRODUCTS
     WHERE product_id IN (?)`,
    [items.map(i => i.product_id)]
  );

  const productMap = new Map(
    products.map(p => [p.product_id, p])
  );


  for (const item of items) {
    const product = productMap.get(item.product_id);
  
    if (!product) throw new Error(`Product ${item.product_id} not found`);
    if (item.quantity <= 0) throw new Error(`Invalid quantity`);
    if (product.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.product_id}`);
    }
  
    totalPrice += Number(product.base_price) * item.quantity;
  
    enrichedItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: product.base_price
    });
  }

  const orderData = {
    customer_id: customerId,
    delivery_address,
    notes,
    total_price: totalPrice
  };

  const orderId = await createOrderWithItems(orderData, enrichedItems);

  productModel.invalidateProductCache();

  return {
    order_id: orderId,
    total_price: totalPrice
  };
}

*/


async function createOrderWithItems(orderData, items) {
    const connection = await pool.getConnection();
  
    try { 
      await connection.beginTransaction();

      for (const item of items) {
        const [result] = await connection.query(
          `UPDATE PRODUCTS
           SET stock_quantity = stock_quantity - ?
           WHERE product_id = ?
           AND stock_quantity >= ?`,
          [item.quantity, item.product_id, item.quantity]
        );
      
        if (result.affectedRows === 0) {
          throw new Error(`Race condition / insufficient stock for product ${item.product_id}`);
        }
      }

      // Insert order
      const [orderResult] = await connection.query(
        `INSERT INTO ORDERS
         (customer_id, delivery_address, notes, total_price)
         VALUES (?, ?, ?, ?)`,
        [
          orderData.customer_id,
          orderData.delivery_address,
          orderData.notes || null,
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


async function assignDriverToOrder(orderId, driverId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock driver
    const [[driver]] = await connection.query(
      `SELECT active, current_orders, max_orders
       FROM DRIVER_PROFILES
       WHERE user_id = ?
       FOR UPDATE`,
      [driverId]
    );

    if (!driver) throw new Error('Driver not found');
    if (!driver.active) throw new Error('Driver not accepting orders');

    // Self-heal counter
    const [[{ actualCount }]] = await connection.query(
      `
      SELECT COUNT(*) as actualCount
      FROM ORDERS
      WHERE driver_id = ?
      AND status IN (${ACTIVE_STATUSES.map(() => '?').join(',')})
      `,
      [driverId, ...ACTIVE_STATUSES]
    );

    if (actualCount !== driver.current_orders) {
      await connection.query(
        `UPDATE DRIVER_PROFILES SET current_orders = ? WHERE user_id = ?`,
        [actualCount, driverId]
      );
      driver.current_orders = actualCount;
    }

    if (driver.current_orders >= driver.max_orders) {
      throw new Error('Driver at capacity');
    }

    // Lock order
    const [orders] = await connection.query(
      `SELECT order_id
       FROM ORDERS
       WHERE order_id = ?
       AND driver_id IS NULL
       AND status = 'pending'
       FOR UPDATE`,
      [orderId]
    );

    if (!orders.length) {
      throw new Error('Order not available');
    }

    await connection.query(
      `UPDATE ORDERS
       SET driver_id = ?, status = 'assigned'
       WHERE order_id = ?`,
      [driverId, orderId]
    );

    await connection.query(
      `UPDATE DRIVER_PROFILES
       SET current_orders = current_orders + 1
       WHERE user_id = ?`,
      [driverId]
    );

    await connection.commit();

    invalidateOrderCache();

    return { order_id: orderId, driver_id: driverId };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/*
async function assignDriverToOrder(orderId, driverId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lock driver row
    const [drivers] = await connection.query(
      `
      SELECT active, current_orders, max_orders
      FROM DRIVER_PROFILES
      WHERE user_id = ?
      FOR UPDATE
      `,
      [driverId]
    );

    if (!drivers.length) {
      throw new Error('Driver not found');
    }

    const driver = drivers[0];

    if (!driver.active) {
      throw new Error('Driver is not accepting orders');
    }

    if (driver.current_orders >= driver.max_orders) {
      throw new Error('Driver has reached maximum capacity');
    }

    // 2. Lock target order
    const [orders] = await connection.query(
      `
      SELECT order_id
      FROM ORDERS
      WHERE order_id = ?
        AND driver_id IS NULL
        AND status = 'pending'
      FOR UPDATE
      `,
      [orderId]
    );

    if (!orders.length) {
      throw new Error('Order not found or already assigned');
    }

    // 3. Assign order
    await connection.query(
      `
      UPDATE ORDERS
      SET driver_id = ?, status = 'assigned'
      WHERE order_id = ?
      `,
      [driverId, orderId]
    );

    // 4. Increment driver's current_orders
    await connection.query(
      `
      UPDATE DRIVER_PROFILES
      SET current_orders = current_orders + 1
      WHERE user_id = ?
      `,
      [driverId]
    );

    await connection.commit();

    return {
      order_id: orderId,
      driver_id: driverId
    };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
  */


async function updateOrderStatus(orderId, driverId, newStatus) {
  const connection = await pool.getConnection();

  const validTransitions = {
    assigned: ['in_progress'],
    in_progress: ['ready_for_pickup', 'stuck'],
    ready_for_pickup: ['in_transit', 'stuck'],
    in_transit: ['done', 'stuck'],
    done: [],
    stuck: []
  };

  try {
    await connection.beginTransaction();

    const [[order]] = await connection.query(
      `SELECT status, driver_id
       FROM ORDERS
       WHERE order_id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (!order) throw new Error('Order not found');
    if (newStatus === 'cancelled') {
      throw new Error('Drivers cannot cancel orders');
    }    
    if (order.driver_id !== driverId) {
      throw new Error('Unauthorized');
    }

    // Lock driver
    const [[driver]] = await connection.query(
      `SELECT current_orders
       FROM DRIVER_PROFILES
       WHERE user_id = ?
       FOR UPDATE`,
      [driverId]
    );

    if (!driver) throw new Error('Driver not found');

    // Self-heal counter
    const [[{ actualCount }]] = await connection.query(
      `
      SELECT COUNT(*) as actualCount
      FROM ORDERS
      WHERE driver_id = ?
      AND status IN (${ACTIVE_STATUSES.map(() => '?').join(',')})
      `,
      [driverId, ...ACTIVE_STATUSES]
    );

    if (actualCount !== driver.current_orders) {
      await connection.query(
        `UPDATE DRIVER_PROFILES SET current_orders = ? WHERE user_id = ?`,
        [actualCount, driverId]
      );
    }

    const expectedNext = validTransitions[order.status] || [];

    if (!expectedNext.includes(newStatus)) {
      throw new Error(`Invalid transition`);
    }

    if (newStatus === 'done') {
      await connection.query(
        `
        UPDATE ORDERS
        SET status = ?, order_finished = CURRENT_TIMESTAMP
        WHERE order_id = ?
        `,
        [newStatus, orderId]
      );

      await connection.query(
        `
        UPDATE DRIVER_PROFILES
        SET current_orders = GREATEST(current_orders - 1, 0)
        WHERE user_id = ?
        `,
        [driverId]
      );

    } else {
      await connection.query(
        `UPDATE ORDERS SET status = ? WHERE order_id = ?`,
        [newStatus, orderId]
      );
    }

    await connection.commit();

    invalidateOrderCache();

    return { order_id: orderId, status: newStatus };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}


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
      LEFT JOIN CUSTOMER_PROFILES cp
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
      AND o.status IN (${ACTIVE_STATUSES.map(() => '?').join(',')})
      ORDER BY o.order_id, oi.product_id;

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
            tel: row.customer_tel
          },
          items: []
        };
      }
  
      // Skip null items (LEFT JOIN case)
      if (row.product_id) {
        ordersMap[row.order_id].items.push({
          name: row.product_name,
          quantity: row.quantity
        });
      }
    }
  
    return Object.values(ordersMap);
  }

  // 


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
        status: 'cancelled'
      };
  
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }


  async function setDriverAvailability(driverId, isActive) {
    const [result] = await pool.query(
      `
      UPDATE DRIVER_PROFILES
      SET active = ?
      WHERE user_id = ?
      `,
      [isActive, driverId]
    );
  
    if (result.affectedRows === 0) {
      throw new Error('Driver not found');
    }
  
    return {
      driver_id: driverId,
      active: isActive
    };
  }


  async function getAllDrivers() {
    const [rows] = await pool.query(
      `
      SELECT 
        dp.driver_id,
        dp.user_id,
        dp.vehicle_info,
        dp.active,
        dp.current_orders,
        dp.max_orders,
  
        u.full_name,
        u.email,
        u.created_at,
        u.last_login
  
      FROM DRIVER_PROFILES dp
      JOIN USERS u ON dp.user_id = u.user_id
      ORDER BY dp.driver_id DESC
      `
    );
  
    return rows;
  }  


const orderCache = new Map();
const ORDER_CACHE_TTL = 60 * 1000; // 1 min

function invalidateOrderCache() {
  orderCache.clear();
}

function normalizeCursor(cursor) {
  const parsed = Number(cursor);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

const DEFAULT_LIMIT = 5;

async function getOrdersCursor(rawCursor = 0) {
  const cursor = normalizeCursor(rawCursor);
  const limit = Math.min(DEFAULT_LIMIT, 5);

  const key = `orders:${cursor}:${limit}`;
  const now = Date.now();

  const cached = orderCache.get(key);

  if (cached && (now - cached.timestamp < ORDER_CACHE_TTL)) {
    console.log("Order cache hit:", key);
    return cached.data;
  }

  const fetchPromise = (async () => {
    try {
      // 1. Get orders ONLY (no joins!)
      const [orders] = await pool.query(
        `
        SELECT 
          order_id,
          customer_id,
          driver_id,
          status,
          delivery_address,
          notes,
          ordered_at,
          total_price
        FROM ORDERS
        WHERE order_id > ?
        ORDER BY order_id
        LIMIT ?
        `,
        [cursor, limit]
      );

      if (!orders.length) {
        return { data: [], nextCursor: null };
      }

      const orderIds = orders.map(o => o.order_id);

      // 2. Fetch items
      const [items] = await pool.query(
        `
        SELECT 
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.unit_price,
          p.name AS product_name
        FROM ORDER_ITEMS oi
        LEFT JOIN PRODUCTS p ON oi.product_id = p.product_id
        WHERE oi.order_id IN (?)
        `,
        [orderIds]
      );

      // 3. Shape
      const ordersMap = {};

      for (const order of orders) {
        ordersMap[order.order_id] = {
          ...order,
          items: []
        };
      }

      for (const item of items) {
        if (ordersMap[item.order_id]) {
          ordersMap[item.order_id].items.push({
            product_id: item.product_id,
            name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price
          });
        }
      }

      const result = {
        data: Object.values(ordersMap),
        nextCursor: orders.length
          ? orders[orders.length - 1].order_id
          : null
      };

      return result;

    } catch (err) {
      orderCache.delete(key);
      throw err;
    }
  })();

  orderCache.set(key, {
    data: fetchPromise,
    timestamp: now
  });

  return fetchPromise;
}

async function getOrdersByCustomerId(customerId, { limit = 5, offset = 0, status } = {}) {

  console.log(customerId);
  let query = `
    SELECT o.order_id, o.status, o.delivery_address, o.total_price, o.ordered_at
    FROM ORDERS o
    WHERE o.customer_id = ?
  `;
  const params = [customerId];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.ordered_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);
  return rows;
}


module.exports = {
createOrder,
getOrderById,
assignDriverToOrder,
getAssignedOrders,
updateOrderStatus,
setDriverAvailability,
cancelOrder,
getAllDrivers,
getOrdersCursor,
getOrdersByCustomerId
};

const pool = require('../config/db');
const productModel = require('./productsService.js');
const getCoords = require('../utils/geocoder.js');

// LUO TILAUS (Transaktio, Saldo-Tarkistus ja Geocoding)
async function createOrder(customerId, deliveryAddress, notes, items) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let totalPrice = 0;

    // TARKISTETAAN SALDOT JA LASKETAAN KOKONAISHINTA
    for (const item of items) {
      // 'FOR UPDATE' lukitsee tuoterivin transaktion ajaksi, estäen päällekkäiset ostot
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
        lng = coords.lng;
      }
    } catch (err) {
      console.error('Geocoding failed during order creation:', err);
    }

    // LUODAAN TILAUS (Vain olemassa olevat sarakkeet)
    const [orderRes] = await connection.query(
      `INSERT INTO ORDERS (customer_id, delivery_address, notes, total_price, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [customerId, deliveryAddress, notes, totalPrice]
    );
    const orderId = orderRes.insertId;

    // LISÄTÄÄN TUOTTEET TILAUKSEEN JA VÄHENNETÄÄN VARASTOSALDO
    for (const item of items) {
      const [pRows] = await connection.query(
        `SELECT base_price FROM PRODUCTS WHERE product_id = ?`,
        [item.product_id]
      );
      const unitPrice = pRows[0].base_price;

      await connection.query(
        `INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, unit_price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, unitPrice]
      );

      await connection.query(
        `UPDATE PRODUCTS SET stock_quantity = stock_quantity - ? WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // LUODAAN TRACKING-RIVI LIVE-KARTTAA VARTEN
    await connection.query(
      `INSERT INTO DELIVERY_TRACKING (order_id, status, latitude, longitude) 
       VALUES (?, 'pending', ?, ?)`,
      [orderId, lat, lng]
    );

    // Jos kaikki onnistui, tallennetaan muutokset pysyvästi
    await connection.commit();
    return {
      order_id: orderId,
      total_price: totalPrice,
      coords: {lat, lng},
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// HAE TILAUS ID:LLÄ
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

// ADMIN: HAE KAIKKI TILAUKSET (Näkymää varten)
async function getAllOrdersAdmin() {
  const query = `
    SELECT 
      o.order_id, 
      o.status, 
      o.delivery_address, 
      o.notes, 
      o.ordered_at, 
      o.total_price, 
      o.driver_id,
      cu.full_name AS customerName,
      dr.full_name AS driverName,
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

// ADMIN: MÄÄRÄÄ KUSKI (Ja aseta status)
async function assignDriver(orderId, driverId, newStatus) {
  const [result] = await pool.query(
    `UPDATE ORDERS SET driver_id = ?, status = ? WHERE order_id = ?`,
    [driverId, newStatus, orderId]
  );
  return result.affectedRows > 0;
}

// YLEINEN STATUS PÄIVITYS (Automaatiota / Kuskeja varten)
async function updateOrderStatus(orderId, status) {
  const [result] = await pool.query(
    `UPDATE ORDERS SET status = ? WHERE order_id = ?`,
    [status, orderId]
  );
  return result.affectedRows > 0;
}

// PERUUTA TILAUS (Sisältää varaston palautuksen)
async function cancelOrder(orderId) {
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

    // Päivitä kuskin tilausmäärä (jos oli määritetty)
    if (order.driver_id) {
      await connection.query(
        `UPDATE DRIVER_PROFILES SET current_orders = GREATEST(current_orders - 1, 0) WHERE user_id = ?`,
        [order.driver_id]
      );
    }

    // Merkitse peruututuksi
    await connection.query(
      `UPDATE ORDERS SET status = 'cancelled' WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit();

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

// KUSKI: HAE OMAT TILAUKSESI
const ACTIVE_STATUSES = [
  'assigned',
  'in_progress',
  'ready_for_pickup',
  'in_transit',
];
async function getAssignedOrders(driverId) {
  if (!driverId) throw new Error('Driver ID is required');

  const [rows] = await pool.query(
    `
    SELECT
      o.order_id, o.status, o.delivery_address, o.notes, o.ordered_at, o.scheduled_delivery,
      cp.company_name, cp.address AS customer_address, cp.tel AS customer_tel,
      dp.vehicle_info, dp.active AS driver_active,
      oi.product_id, oi.quantity, oi.unit_price,
      p.name AS product_name
    FROM ORDERS o
    JOIN CUSTOMER_PROFILES cp ON o.customer_id = cp.user_id
    LEFT JOIN DRIVER_PROFILES dp ON o.driver_id = dp.user_id
    LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
    LEFT JOIN PRODUCTS p ON oi.product_id = p.product_id
    WHERE o.driver_id = ? AND o.status IN (?, ?, ?, ?)
    ORDER BY o.order_id;
    `,
    [driverId, ...ACTIVE_STATUSES]
  );

  if (!rows.length) return [];

  // Shape the data
  const ordersMap = {};
  for (const row of rows) {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        order_id: row.order_id,
        status: row.status,
        delivery_address: row.delivery_address,
        notes: row.notes,
        customer: {company_name: row.company_name, tel: row.tel},
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

// ASIAKAS: HAE OMAT TILAUKSET
const getOrdersByCustomerId = async (
  customerId,
  {limit = 20, offset = 0, status = null} = {}
) => {
  let query = `
    SELECT
      o.order_id, o.status, o.delivery_address, o.total_price, o.ordered_at,
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

  query += ` GROUP BY o.order_id ORDER BY o.ordered_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  try {
    const [orders] = await pool.query(query, params);
    return orders;
  } catch (error) {
    console.error('Error in getOrdersByCustomerId service:', error);
    throw new Error('Could not fetch orders from database');
  }
};

// ASIAKAS: HAE TILAUSTILASTOT
async function getOrderStats(customerId) {
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

// KUSKI: ASETA AKTIIVISUUS (Töissä / Vapaalla)
async function setDriverAvailability(driverId, active) {
  const query = `UPDATE DRIVER_PROFILES SET active = ? WHERE user_id = ?`;
  const [result] = await pool.query(query, [active ? 1 : 0, driverId]);
  return result.affectedRows > 0;
}

// HAE KAIKKI KUSKIT
async function getAllDrivers() {
  const query = `
    SELECT u.user_id, u.full_name, u.email, d.active AS is_available 
    FROM USERS u
    JOIN DRIVER_PROFILES d ON u.user_id = d.user_id
    WHERE u.role = 'driver'
  `;
  const [rows] = await pool.query(query);
  return rows;
}

// HAE TILAUKSET CURSORILLA (Lataava scrollaus)
async function getOrdersCursor(cursor = 0, limit = 20) {
  const query = `
    SELECT * FROM ORDERS 
    WHERE order_id > ? 
    ORDER BY order_id ASC 
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [Number(cursor), Number(limit)]);
  const nextCursor = rows.length > 0 ? rows[rows.length - 1].order_id : null;
  return {data: rows, nextCursor};
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrdersAdmin,
  assignDriver,
  updateOrderStatus,
  cancelOrder,
  getAssignedOrders,
  getOrdersByCustomerId,
  getOrderStats,
  setDriverAvailability,
  getAllDrivers,
  getOrdersCursor,
};

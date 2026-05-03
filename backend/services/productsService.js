// GET ALL PRODUCTS

/*
async function getAllProducts() { // OUTDATED (WARNING) DO NOT USE
  const [rows] = await pool.query(
  `SELECT 
  p.*,
  c.name AS category_name
  FROM PRODUCTS p
  LEFT JOIN CATEGORIES c
  ON p.category_id = c.category_id;`
);
  return rows;
}

*/


const pool = require('../config/db');

const DEFAULT_LIMIT = 16;

function normalizeCursor(cursor) {
  const parsed = Number(cursor);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
}

const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 min

function invalidateProductCache() {
  cache.clear();
}

async function getProductsCursor(rawCursor = 0) {
  const cursor = normalizeCursor(rawCursor);
  const limit = DEFAULT_LIMIT;

  const key = `products:${cursor}:${limit}`;
  const now = Date.now();

  const cached = cache.get(key);

  // Return cached if still valid
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log("Cache valid - ", key);
    return cached.data;
  }

  // Create promise
  const fetchPromise = (async () => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.product_id,
          p.name,
          p.description,
          p.base_price,
          p.stock_quantity,
          GROUP_CONCAT(c.name) AS categories
        FROM PRODUCTS p
        LEFT JOIN PRODUCT_CATEGORIES pc ON p.product_id = pc.product_id
        LEFT JOIN CATEGORIES c ON pc.category_id = c.category_id
        WHERE p.product_id > ?
        GROUP BY p.product_id
        ORDER BY p.product_id
        LIMIT ?
      `, [cursor, limit]);

      return {
        data: rows,
        nextCursor: rows.length
          ? rows[rows.length - 1].product_id
          : null
      };

    } catch (err) {
      cache.delete(key);
      throw err;
    }
  })();

  // Store promise immediately (coalescing)
  cache.set(key, {
    data: fetchPromise,
    timestamp: now
  });

  return fetchPromise;
}


async function getProductById(product_id) {

  const [rows] = await pool.query(
    `SELECT 
       p.product_id,
       p.name,
       p.description,
       p.base_price,
       p.stock_quantity,
       GROUP_CONCAT(c.name) AS categories
     FROM PRODUCTS p
     LEFT JOIN PRODUCT_CATEGORIES pc ON p.product_id = pc.product_id
     LEFT JOIN CATEGORIES c ON pc.category_id = c.category_id
     WHERE p.product_id = ?
     GROUP BY p.product_id`,
    [product_id]
  );

  return rows[0] || null;
}


function validateProduct({ name, base_price, stock_quantity }) {
  if (!name || typeof name !== 'string') {
    throw new Error("Invalid product name");
  }

  const price = Number(base_price);
  const stock = Number(stock_quantity);

  if (!Number.isFinite(price)) {
    throw new Error("Invalid base_price");
  }

  if (price < 0) {
    throw new Error("base_price cannot be negative");
  }

  if (!Number.isInteger(stock)) {
    throw new Error("Invalid stock_quantity");
  }

  if (stock < 0) {
    throw new Error("stock_quantity cannot be negative");
  }
}

async function createProduct(name, description, base_price, stock_quantity, category_names = []) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();


    validateProduct({ name, base_price, stock_quantity });

    // 1. Insert product
    const [result] = await connection.query(
      `INSERT INTO PRODUCTS (name, description, base_price, stock_quantity)
       VALUES (?, ?, ?, ?)`,
       [name, description || null, base_price, stock_quantity]
    );

    const productId = result.insertId;

    // 2. Handle categories
    if (category_names.length > 0) {
      const [categories] = await connection.query(
        `SELECT category_id, name FROM CATEGORIES WHERE name IN (?)`,
        [category_names]
      );

      if (categories.length !== category_names.length) {
        throw new Error("One or more categories invalid");
      }

      const values = categories.map(c => [productId, c.category_id]);

      await connection.query(
        `INSERT INTO PRODUCT_CATEGORIES (product_id, category_id)
         VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    invalidateProductCache();

    return { product_id: productId };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}


async function createCategory(name) {
  const [result] = await pool.query(
    `INSERT INTO CATEGORIES (name) VALUES (?)`,
    [name]
  );

  return {
    category_id: result.insertId,
    name
  };
}

async function getCategories() {
  const [rows] = await pool.query(
    `SELECT * FROM CATEGORIES ORDER BY name`
  );

  return rows;
}



// UPDATE PRODUCT
async function updateProduct(id, name, description, base_price, stock_quantity) {
  validateProduct({ name, base_price, stock_quantity });
  const [result] = await pool.query(
    `UPDATE PRODUCTS
     SET name = ?, description = ?, base_price = ?, stock_quantity = ?
     WHERE product_id = ?`,
     [name, description || null, base_price, stock_quantity, id]
  );

  invalidateProductCache(); // REMEMBER TO ADD IN CREATE ORDER 
  return result.affectedRows;
}


// Please add a service to remove a product based on ID. Only admin has rights for this. 

async function deleteProduct(productId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Delete the product. 
    // Note: If you have ON DELETE CASCADE on PRODUCT_CATEGORIES, those links drop automatically.
    const [result] = await connection.query(
      `DELETE FROM PRODUCTS WHERE product_id = ?`,
      [productId]
    );

    if (result.affectedRows === 0) {
      throw new Error(`Product ${productId} not found`);
    }

    await connection.commit();

    // Critical: Clear the cache so the deleted item stops showing up on the frontend
    invalidateProductCache();

    return { 
      product_id: productId, 
      deleted: true 
    };

  } catch (err) {
    await connection.rollback();
    
    // Safety Net: Catch foreign key constraint errors
    // (e.g., If this product is already tied to past customer orders)
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      throw new Error('Cannot delete product: It is tied to existing order history. Consider setting stock to 0 instead.');
    }
    
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsCursor,
  createCategory,
  getCategories,
  invalidateProductCache
};
/**
 * @fileoverview Product Service.
 * Manages the product catalog, including stock logic, category assignments, and cursor pagination.
 */

import pool from '../config/db.js';

/**
 * Retrieves all products along with their assigned categories.
 */
export async function getAllProducts() {
  const query = `
    SELECT 
      P.*,
      GROUP_CONCAT(C.name SEPARATOR ',') AS categories_list
    FROM PRODUCTS P
    LEFT JOIN PRODUCT_CATEGORIES PC ON P.product_id = PC.product_id
    LEFT JOIN CATEGORIES C ON PC.category_id = C.category_id
    GROUP BY P.product_id
  `;
  const [rows] = await pool.query(query);

  return rows.map((row) => {
    const catArray = row.categories_list ? row.categories_list.split(',') : [];
    return {
      ...row,
      categories: catArray,
      category_name: catArray[0] || 'Muut',
    };
  });
}

/**
 * Retrieves a single product by its ID.
 */
export async function getProductById(product_id) {
  const query = `
    SELECT 
      P.*,
      GROUP_CONCAT(C.name SEPARATOR ',') AS categories_list
    FROM PRODUCTS P
    LEFT JOIN PRODUCT_CATEGORIES PC ON P.product_id = PC.product_id
    LEFT JOIN CATEGORIES C ON PC.category_id = C.category_id
    WHERE P.product_id = ?
    GROUP BY P.product_id
  `;
  const [rows] = await pool.query(query, [product_id]);

  if (rows.length === 0) return null;

  const row = rows[0];
  const catArray = row.categories_list ? row.categories_list.split(',') : [];

  return {
    ...row,
    categories: catArray,
    category_name: catArray[0] || 'Muut',
  };
}

/**
 * Internal helper to strictly validate product data before insertion/updating.
 */
function validateProduct({name, base_price, stock_quantity}) {
  if (!name || typeof name !== 'string')
    throw new Error('Invalid product name');

  const price = Number(base_price);
  const stock = Number(stock_quantity);

  if (!Number.isFinite(price) || price < 0)
    throw new Error('Invalid or negative base_price');
  if (!Number.isInteger(stock) || stock < 0)
    throw new Error('Invalid or negative stock_quantity');
}

/**
 * Creates a new product and links it to categories via a transaction.
 */
export async function createProduct(
  name,
  description,
  base_price,
  stock_quantity,
  categoryNames = []
) {
  validateProduct({name, base_price, stock_quantity});

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO PRODUCTS (name, description, base_price, stock_quantity) VALUES (?, ?, ?, ?)`,
      [name, description, base_price, stock_quantity]
    );
    const productId = result.insertId;

    if (categoryNames && categoryNames.length > 0) {
      const [catRows] = await connection.query(
        `SELECT category_id FROM CATEGORIES WHERE name IN (?)`,
        [categoryNames]
      );

      if (catRows.length !== categoryNames.length)
        throw new Error('One or more categories invalid');

      if (catRows.length > 0) {
        const values = catRows.map((c) => [productId, c.category_id]);
        await connection.query(
          `INSERT INTO PRODUCT_CATEGORIES (product_id, category_id) VALUES ?`,
          [values]
        );
      }
    }

    await connection.commit();
    return productId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Updates an existing product and recreates its category links.
 */
export async function updateProduct(
  id,
  name,
  description,
  base_price,
  stock_quantity,
  categoryNames = []
) {
  validateProduct({name, base_price, stock_quantity});

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE PRODUCTS SET name = ?, description = ?, base_price = ?, stock_quantity = ? WHERE product_id = ?`,
      [name, description, base_price, stock_quantity, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return 0;
    }

    await connection.query(
      `DELETE FROM PRODUCT_CATEGORIES WHERE product_id = ?`,
      [id]
    );

    if (categoryNames && categoryNames.length > 0) {
      const [catRows] = await connection.query(
        `SELECT category_id FROM CATEGORIES WHERE name IN (?)`,
        [categoryNames]
      );

      if (catRows.length > 0) {
        const values = catRows.map((c) => [id, c.category_id]);
        await connection.query(
          `INSERT INTO PRODUCT_CATEGORIES (product_id, category_id) VALUES ?`,
          [values]
        );
      }
    }

    await connection.commit();
    return result.affectedRows;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

const normalizeCursor = (cursor) => {
  const parsed = Number(cursor);
  return !Number.isFinite(parsed) || parsed < 0 ? 0 : Math.floor(parsed);
};

const normalizeLimit = (limit, defaultLimit = 24, maxLimit = 24) => {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultLimit;
  return Math.min(Math.floor(parsed), maxLimit);
};

/**
 * Fetches the product catalog using cursor-based pagination and optional search filter.
 */
export async function getProductsCursor(
  rawCursor = 0,
  rawLimit = 24,
  search = null
) {
  const cursor = normalizeCursor(rawCursor);
  const limit = normalizeLimit(rawLimit, 24, 24);

  let query = `
    SELECT 
      P.*,
      GROUP_CONCAT(C.name SEPARATOR ',') AS categories_list
    FROM PRODUCTS P
    LEFT JOIN PRODUCT_CATEGORIES PC ON P.product_id = PC.product_id
    LEFT JOIN CATEGORIES C ON PC.category_id = C.category_id
    WHERE P.product_id > ? 
  `;

  const queryParams = [cursor];

  if (search) {
    query += ` AND P.name LIKE ? `;
    queryParams.push(`%${search}%`);
  }

  query += ` GROUP BY P.product_id ORDER BY P.product_id ASC LIMIT ?`;
  queryParams.push(limit);

  const [rows] = await pool.query(query, queryParams);

  const processedRows = rows.map((row) => {
    const catArray = row.categories_list ? row.categories_list.split(',') : [];
    return {
      ...row,
      categories: catArray,
      category_name: catArray[0] || 'Muut',
    };
  });

  const nextCursor =
    processedRows.length === limit
      ? processedRows[processedRows.length - 1].product_id
      : null;
  return {data: processedRows, nextCursor};
}

/**
 * Fetches products filtered by specific categories using cursor pagination.
 */
export async function getProductsByCategoryCursor(
  categories,
  rawCursor = 0,
  rawLimit = 24
) {
  const categoryNames = Array.isArray(categories) ? categories : [categories];
  if (!categoryNames || categoryNames.length === 0)
    throw new Error('At least one category is required');

  const cursor = normalizeCursor(rawCursor);
  const limit = normalizeLimit(rawLimit, 24, 24);

  const [catCheck] = await pool.query(
    `SELECT category_id FROM CATEGORIES WHERE name IN (?)`,
    [categoryNames]
  );

  if (catCheck.length === 0) return {data: [], nextCursor: null};
  const categoryIds = catCheck.map((c) => c.category_id);

  const query = `
    SELECT 
      P.*,
      GROUP_CONCAT(DISTINCT C.name SEPARATOR ',') AS categories_list
    FROM PRODUCTS P
    INNER JOIN PRODUCT_CATEGORIES PC_FILTER ON P.product_id = PC_FILTER.product_id 
    LEFT JOIN PRODUCT_CATEGORIES PC ON P.product_id = PC.product_id
    LEFT JOIN CATEGORIES C ON PC.category_id = C.category_id
    WHERE PC_FILTER.category_id IN (?) AND P.product_id > ?
    GROUP BY P.product_id
    ORDER BY P.product_id ASC 
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [categoryIds, cursor, limit]);

  const processedRows = rows.map((row) => {
    const catArray = row.categories_list ? row.categories_list.split(',') : [];
    return {...row, categories: catArray, category_name: catArray[0] || 'Muut'};
  });

  const nextCursor =
    processedRows.length === limit
      ? processedRows[processedRows.length - 1].product_id
      : null;
  return {data: processedRows, nextCursor};
}

/**
 * Deletes a product from the database.
 * If ON DELETE CASCADE is set for PRODUCT_CATEGORIES, relationships drop automatically.
 * Will throw an error if the product is tied to historical orders.
 */
export async function deleteProduct(productId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `DELETE FROM PRODUCTS WHERE product_id = ?`,
      [productId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      throw new Error(`Product with ID ${productId} not found`);
    }

    await connection.commit();
    return {product_id: productId, deleted: true};
  } catch (err) {
    await connection.rollback();
    if (
      err.code === 'ER_ROW_IS_REFERENCED_2' ||
      err.code === 'ER_ROW_IS_REFERENCED'
    ) {
      throw new Error(
        'Cannot delete product: It is tied to existing order history. Consider setting stock to 0 instead.'
      );
    }
    throw err;
  } finally {
    connection.release();
  }
}

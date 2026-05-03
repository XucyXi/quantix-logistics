const pool = require('../config/db');

// GET ALL PRODUCTS
async function getAllProducts() {
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

  // Parsitaan SQL:n pilkulla eroteltu merkkijono takaisin taulukoksi (Array) frontendille
  return rows.map((row) => {
    const catArray = row.categories_list ? row.categories_list.split(',') : [];
    return {
      ...row,
      categories: catArray,
      category_name: catArray[0] || 'Muut', // Yhteensopivuus vanhalle frontend-sivulle
    };
  });
}

// GET PRODUCT BY ID
async function getProductById(product_id) {
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

// SYÖTTEIDEN VALIDIOINTI
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

// CREATE PRODUCT (TRANSAKTIO)
async function createProduct(
  name,
  description,
  base_price,
  stock_quantity,
  categoryNames = []
) {
  validateProduct({ name, base_price, stock_quantity });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Luodaan tuote
    const [result] = await connection.query(
      `INSERT INTO PRODUCTS (name, description, base_price, stock_quantity)
       VALUES (?, ?, ?, ?)`,
      [name, description, base_price, stock_quantity]
    );
    const productId = result.insertId;

    // 2. Linkitetään kategoriat välitauluun
    if (categoryNames && categoryNames.length > 0) {
      const [catRows] = await connection.query(
        `SELECT category_id FROM CATEGORIES WHERE name IN (?)`,
        [categoryNames]
      );

      if (catRows.length !== categoryNames.length) {
        throw new Error("One or more categories invalid");
      }

      if (catRows.length > 0) {
        // Luodaan array inserttiä varten: [[tuote_id, kategoria_id1], [tuote_id, kategoria_id2]]
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
    await connection.rollback(); // Jos jokin menee pieleen, perutaan kaikki
    throw err;
  } finally {
    connection.release(); // Vapautetaan yhteys takaisin pooliin
  }
}

// UPDATE PRODUCT (TRANSAKTIO)
async function updateProduct(
  id,
  name,
  description,
  base_price,
  stock_quantity,
  categoryNames = []
) {

  validateProduct({ name, base_price, stock_quantity });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Päivitetään tuotteen tiedot
    const [result] = await connection.query(
      `UPDATE PRODUCTS
       SET name = ?, description = ?, base_price = ?, stock_quantity = ?
       WHERE product_id = ?`,
      [name, description, base_price, stock_quantity, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return 0; // Tuotetta ei löytynyt
    }

    // 2. Päivitetään kategoriat (Helpoin tapa: poistetaan vanhat linkitykset ja lisätään uudet)
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

function normalizeCursor(cursor) {
  const parsed = Number(cursor);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

// Default is 16, and the maximum is strictly clamped to 16
function normalizeLimit(limit, defaultLimit = 16, maxLimit = 16) {
  const parsed = Number(limit);
  // Default to 16 if the input is invalid, zero, or negative
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultLimit;
  // Cap the limit to the maxLimit (16)
  return Math.min(Math.floor(parsed), maxLimit);
}

// GET PRODUCTS CURSOR
async function getProductsCursor(rawCursor = 0, rawLimit = 16) {
  const cursor = normalizeCursor(rawCursor);
  const limit = normalizeLimit(rawLimit);
  
  const query = `
    SELECT 
      P.*,
      GROUP_CONCAT(C.name SEPARATOR ',') AS categories_list
    FROM PRODUCTS P
    LEFT JOIN PRODUCT_CATEGORIES PC ON P.product_id = PC.product_id
    LEFT JOIN CATEGORIES C ON PC.category_id = C.category_id
    WHERE P.product_id > ? 
    GROUP BY P.product_id
    ORDER BY P.product_id ASC 
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [Number(cursor), Number(limit)]);

  const processedRows = rows.map((row) => {
    const catArray = row.categories_list ? row.categories_list.split(',') : [];
    return {
      ...row,
      categories: catArray,
      category_name: catArray[0] || 'Muut',
    };
  });

  const nextCursor =
    processedRows.length > 0
      ? processedRows[processedRows.length - 1].product_id
      : null;

  return {data: processedRows, nextCursor};
}

// DELETE PRODUCT (TRANSAKTIO)
async function deleteProduct(productId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Poistetaan tuote 
    // Huom: Jos tietokannassa on ON DELETE CASCADE taulussa PRODUCT_CATEGORIES, 
    // kategoriayhteydet poistuvat automaattisesti.
    const [result] = await connection.query(
      `DELETE FROM PRODUCTS WHERE product_id = ?`,
      [productId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      throw new Error(`Product with ID ${productId} not found`);
    }

    await connection.commit();

    return { 
      product_id: productId, 
      deleted: true 
    };

  } catch (err) {
    await connection.rollback();
    
    // Turvaverkko: Estetään tuotteen poistaminen, jos se on jo sidottu tilaushistoriaan
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      throw new Error('Cannot delete product: It is tied to existing order history. Consider setting stock to 0 instead.');
    }
    
    throw err;
  } finally {
    connection.release();
  }
}



module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  getProductsCursor,
  deleteProduct
};

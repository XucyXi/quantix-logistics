const pool = require('../config/db');

// GET ALL PRODUCTS
async function getAllProducts() {
  const [rows] = await pool.query(`SELECT * FROM PRODUCTS`);
  return rows;
}

async function getProductById(product_id) {
  console.log("🧪 Querying DB with:", product_id);

  const [rows] = await pool.query(
    `SELECT * FROM PRODUCTS WHERE product_id = ?`,
    [product_id]
  );

  console.log("🧪 DB RESULT:", rows);

  return rows[0] || null;
}


// CREATE PRODUCT
async function createProduct(name, base_price, stock_quantity) {
  const [result] = await pool.query(
    `INSERT INTO PRODUCTS (name, base_price, stock_quantity)
     VALUES (?, ?, ?)`,
    [name, base_price, stock_quantity]
  );

  return result.insertId;
}

// UPDATE PRODUCT
async function updateProduct(id, name, base_price, stock_quantity) {
  const [result] = await pool.query(
    `UPDATE PRODUCTS
     SET name = ?, base_price = ?, stock_quantity = ?
     WHERE product_id = ?`,
    [name, base_price, stock_quantity, id]
  );
  return result.affectedRows;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
};
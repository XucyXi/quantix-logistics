const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'; // put strong secret in .env

/*
async function register({ email, password, role}) {

    // 1. Check if user already exists
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existing.length) {
      throw new Error('User already exists');
    }
  
    // 2. Hash the password
    const password_hash = await bcrypt.hash(password, 10); // 10 is considered our salt value, the salt that adds to the hashing, to differentiate each password (same passwords can have same hashing pattern without salt)
  
    // 3. Insert user into DB
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, password_hash, role]
    );
  
    // 4. Return basic info
    return { user_id: result.insertId, email, role };
  }
*/

async function register({ email, password, role, extraData = {} }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check if user already exists
    const [existing] = await connection.query(
      `SELECT user_id FROM USERS WHERE email = ?`,
      [email]
    );

    if (existing.length) {
      throw new Error('User already exists');
    }

    // 2. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 3. Insert into USERS
    const [userResult] = await connection.query(
      `INSERT INTO USERS (email, password_hash, role)
       VALUES (?, ?, ?)`,
      [email, password_hash, role]
    );

    const userId = userResult.insertId;

    // 4. Role-based profile creation

    if (role === 'customer') {
      console.log("Creating Customer")
      console.log(
        extraData.company_name,
        extraData.address,
        extraData.tel,
        extraData.vat_number
      );
      await connection.query(
        `INSERT INTO CUSTOMER_PROFILES 
         (user_id, company_name, address, tel, vat_number)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          extraData.company_name || null,
          extraData.address || null,
          extraData.tel || null,
          extraData.vat_number || null
        ]
      );
    }

    if (role === 'driver') {
      console.log("Creating Driver")
      console.log(
        extraData.vehicle_info
      );
      await connection.query(
        `INSERT INTO DRIVER_PROFILES 
         (user_id, vehicle_info, active)
         VALUES (?, ?, TRUE)`,
        [
          userId,
          extraData.vehicle_info || null
        ]
      );
    }

    await connection.commit();

    return {
      user_id: userId,
      email,
      role
    };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

  async function login({ email, password }) {
    // 1. Fetch user by email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) throw new Error('User not found');
  
    const user = rows[0];
  
    // 2. Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Invalid password');
  
    // 3. Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  
    return { token, user_id: user.user_id, role: user.role };
  }
  
module.exports = { register, login };


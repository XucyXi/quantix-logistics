const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'; // put strong secret in .env

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


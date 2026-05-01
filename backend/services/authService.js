const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

/*
async function register({ email, password, role}) {

    // 1. Check if user already exists
    const [existing] = await pool.query(
      'SELECT * FROM USERS WHERE email = ?',
      [email]
    );
    if (existing.length) {
      throw new Error('User already exists');
    }

    // 2. Hash the password
    const password_hash = await bcrypt.hash(password, 10); // 10 is considered our salt value, the salt that adds to the hashing, to differentiate each password (same passwords can have same hashing pattern without salt)

    // 3. Insert user into DB
    const [result] = await pool.query(
      'INSERT INTO USERS (email, password_hash, role) VALUES (?, ?, ?)',
      [email, password_hash, role]
    );

    // 4. Return basic info
    return { user_id: result.insertId, email, role };
  }
*/

async function register({email, password, role, extraData = {}}) {
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
      await connection.query(
        `INSERT INTO CUSTOMER_PROFILES
         (user_id, company_name, address, tel, vat_number)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          extraData.company_name || null,
          extraData.address || null,
          extraData.tel || null,
          extraData.vat_number || null,
        ]
      );
    }

    if (role === 'driver') {
      await connection.query(
        `INSERT INTO DRIVER_PROFILES
         (user_id, vehicle_info, active)
         VALUES (?, ?, TRUE)`,
        [userId, extraData.vehicle_info || null]
      );
    }

    await connection.commit();

    return {
      user_id: userId,
      email,
      role,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function login({email, password}) {
  // 1. Fetch user by email
  const [rows] = await pool.query('SELECT * FROM USERS WHERE email = ?', [
    email,
  ]);
  if (!rows.length) throw new Error('User not found');

  const user = rows[0];

  // 2. Compare password
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Invalid password');

  // 3. Generate JWT token
  const token = jwt.sign({user_id: user.user_id, role: user.role}, JWT_SECRET, {
    expiresIn: '1h',
  });

  return {token, user_id: user.user_id, role: user.role};
}

async function getProfile(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.role,
      cp.company_name,
      cp.vat_number
    FROM USERS u
    LEFT JOIN CUSTOMER_PROFILES cp ON cp.user_id = u.user_id
    WHERE u.user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length) {
    throw new Error('User not found');
  }

  return rows[0];
}

async function updateProfile(userId, profile) {
  const {companyName, vatNumber, fullName} = profile;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (fullName) {
      await connection.query(`UPDATE USERS SET full_name = ? WHERE user_id = ?`, [
        fullName,
        userId,
      ]);
    }

    await connection.query(
      `
      INSERT INTO CUSTOMER_PROFILES (user_id, company_name, vat_number)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        company_name = VALUES(company_name),
        vat_number = VALUES(vat_number)
      `,
      [userId, companyName || null, vatNumber || null]
    );

    await connection.commit();
    return getProfile(userId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function changePassword(userId, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  const [rows] = await pool.query(
    `SELECT password_hash FROM USERS WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (!rows.length) throw new Error('User not found');

  const isCurrentValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!isCurrentValid) throw new Error('Current password is incorrect');

  const password_hash = await bcrypt.hash(newPassword, 10);
  await pool.query(`UPDATE USERS SET password_hash = ? WHERE user_id = ?`, [
    password_hash,
    userId,
  ]);

  return {success: true};
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};

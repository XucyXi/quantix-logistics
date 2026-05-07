/**
 * @fileoverview User Service.
 * Manages user accounts, hashing logic separation, and profile creation via transactions.
 */

import pool from '../config/db.js';

/**
 * Retrieves all users alongside their role-specific profiles.
 */
export async function getAllUsers() {
  const query = `
    SELECT 
      u.user_id, u.full_name, u.email, u.role, u.last_login,
      c.tier,
      d.current_orders,
      d.vehicle_info
    FROM users u
    LEFT JOIN customer_profiles c ON u.user_id = c.user_id
    LEFT JOIN driver_profiles d ON u.user_id = d.user_id
    ORDER BY u.user_id DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
}

/**
 * Verifies if a user exists and returns their base role.
 */
export async function getUserById(userId) {
  const [rows] = await pool.query(
    `SELECT user_id, role FROM users WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * Creates a base user and their corresponding role-specific profile (Driver/Customer) safely.
 */
export async function createUserTransaction(
  fullName,
  email,
  passwordHash,
  role,
  tier,
  vehicleInfo
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userRes] = await connection.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [fullName, email, passwordHash, role]
    );
    const userId = userRes.insertId;

    if (role === 'customer') {
      await connection.query(
        `INSERT INTO customer_profiles (user_id, tier, status) VALUES (?, ?, 'active')`,
        [userId, tier]
      );
    } else if (role === 'driver') {
      await connection.query(
        `INSERT INTO driver_profiles (user_id, active, current_orders, vehicle_info) VALUES (?, ?, ?, ?)`,
        [userId, true, 0, vehicleInfo || null]
      );
    }

    await connection.commit();
    return userId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Updates a user and handles switching between driver and customer profiles if the role changes.
 */
export async function updateUserTransaction(
  userId,
  fullName,
  email,
  passwordHash,
  role,
  tier,
  vehicleInfo
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let userQuery = `UPDATE users SET full_name = ?, email = ?, role = ?`;
    let userParams = [fullName, email, role];

    if (passwordHash) {
      userQuery += `, password_hash = ?`;
      userParams.push(passwordHash);
    }
    userQuery += ` WHERE user_id = ?`;
    userParams.push(userId);

    const [userRes] = await connection.query(userQuery, userParams);

    if (userRes.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    let currentOrders = 0;
    if (role === 'driver') {
      const [existingDriverRows] = await connection.query(
        `SELECT current_orders FROM driver_profiles WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      if (existingDriverRows.length)
        currentOrders = existingDriverRows[0].current_orders;
    }

    await connection.query(`DELETE FROM customer_profiles WHERE user_id = ?`, [
      userId,
    ]);
    await connection.query(`DELETE FROM driver_profiles WHERE user_id = ?`, [
      userId,
    ]);

    if (role === 'customer') {
      await connection.query(
        `INSERT INTO customer_profiles (user_id, tier, status) VALUES (?, ?, 'active')`,
        [userId, tier]
      );
    } else if (role === 'driver') {
      await connection.query(
        `INSERT INTO driver_profiles (user_id, active, current_orders, vehicle_info) VALUES (?, ?, ?, ?)`,
        [userId, true, currentOrders, vehicleInfo || null]
      );
    }

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Deletes a user. Assumes ON DELETE CASCADE is active in the database for profile tables.
 */
export async function deleteUser(userId) {
  const [result] = await pool.query(`DELETE FROM users WHERE user_id = ?`, [
    userId,
  ]);
  return result.affectedRows > 0;
}

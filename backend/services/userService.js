const pool = require('../config/db');

async function getAllUsers() {
  const query = `
    SELECT 
      u.user_id, u.full_name, u.email, u.role, u.last_login,
      c.tier,
      d.current_orders
    FROM USERS u
    LEFT JOIN CUSTOMER_PROFILES c ON u.user_id = c.user_id
    LEFT JOIN DRIVER_PROFILES d ON u.user_id = d.user_id
    ORDER BY u.user_id DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
}

async function createUserTransaction(
  fullName,
  email,
  passwordHash,
  role,
  tier
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Luodaan peruskäyttäjä
    const [userRes] = await connection.query(
      `INSERT INTO USERS (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [fullName, email, passwordHash, role]
    );
    const userId = userRes.insertId;

    // 2. Luodaan profiili roolin mukaan
    if (role === 'customer') {
      await connection.query(
        `INSERT INTO CUSTOMER_PROFILES (user_id, tier, status) VALUES (?, ?, 'active')`,
        [userId, tier]
      );
    } else if (role === 'driver') {
      await connection.query(
        `INSERT INTO DRIVER_PROFILES (user_id, active, current_orders) VALUES (?, ?, ?)`,
        [userId, true, 0]
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

async function updateUserTransaction(
  userId,
  fullName,
  email,
  passwordHash,
  role,
  tier
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Päivitetään peruskäyttäjä
    let userQuery = `UPDATE USERS SET full_name = ?, email = ?, role = ?`;
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
      return false; // Käyttäjää ei löytynyt
    }

    // Helpoin tapa varmistaa eheys: Poistetaan vanhat profiilit ja luodaan uusi.
    await connection.query(`DELETE FROM CUSTOMER_PROFILES WHERE user_id = ?`, [
      userId,
    ]);
    await connection.query(`DELETE FROM DRIVER_PROFILES WHERE user_id = ?`, [
      userId,
    ]);

    if (role === 'customer') {
      await connection.query(
        `INSERT INTO CUSTOMER_PROFILES (user_id, tier, status) VALUES (?, ?, 'active')`,
        [userId, tier]
      );
    } else if (role === 'driver') {
      await connection.query(
        `INSERT INTO DRIVER_PROFILES (user_id, active, current_orders) VALUES (?, ?, ?)`,
        [userId, true, 0]
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

async function deleteUser(userId) {
  // Koska tietokannassa on ON DELETE CASCADE sääntö asettamasi luontiskriptin perusteella,
  // USERS-taulusta poistaminen tuhoaa lennosta myös CUSTOMER ja DRIVER profiilit! Aivan kuin taikaa.
  const [result] = await pool.query(`DELETE FROM USERS WHERE user_id = ?`, [
    userId,
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllUsers,
  createUserTransaction,
  updateUserTransaction,
  deleteUser,
};

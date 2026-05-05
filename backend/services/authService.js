const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

/**
 * Create a new user record, create a role-specific profile, and return the created user's identifier and basic info.
 *
 * If provided, `extraData.full_name` is used for the user's full name; otherwise `extraData.first_name` and
 * `extraData.last_name` are joined, falling back to the email local-part. For `role === 'customer'` the function
 * inserts a CUSTOMER_PROFILES row using `company_name`, `address`, `tel`, and `vat_number` from `extraData`.
 * For `role === 'driver'` the function inserts a DRIVER_PROFILES row using `vehicle_info` from `extraData`.
 *
 * @param {Object} params - Parameters for user registration.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's plain-text password (will be hashed).
 * @param {string} params.role - The user's role; determines which profile row is created.
 * @param {Object} [params.extraData={}] - Optional additional profile fields. Recognized keys: `full_name`, `first_name`, `last_name`, `company_name`, `address`, `tel`, `vat_number`, `vehicle_info`.
 * @returns {{user_id: number, email: string, role: string}} The created user's id, email, and role.
 * @throws {Error} Throws `Error('User already exists')` if an account with the given email already exists.
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

    const fullName =
      extraData.full_name?.trim() ||
      [extraData.first_name, extraData.last_name].filter(Boolean).join(' ') ||
      email.split('@')[0];

    // 3. Insert into USERS
    const [userResult] = await connection.query(
      `INSERT INTO USERS (full_name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [fullName, email, password_hash, role]
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

/**
 * Authenticate a user by email and password and produce a JWT with basic user info.
 *
 * @returns {{token: string, user_id: number, role: string, name: string}} An object containing:
 *  - `token`: JWT signed with the user's id and role (expires in 1 hour).
 *  - `user_id`: The authenticated user's database id.
 *  - `role`: The authenticated user's role.
 *  - `name`: The user's full name if available, otherwise the email local-part.
 */
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

  return {
    token,
    user_id: user.user_id,
    role: user.role,
    name: user.full_name || email.split('@')[0],
  };
}

/**
 * Retrieves the profile for the specified user.
 * @param {number|string} userId - The ID of the user to fetch.
 * @returns {{user_id: number|string, full_name: string|null, email: string, role: string, company_name: string|null, vat_number: string|null}} The user's profile row containing user_id, full_name, email, role, and any associated company_name and vat_number.
 * @throws {Error} If no user with the given ID exists.
 */

/*
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

*/

/**
 * Unified profile fetcher.
 * Uses the userId to determine the role and return role-specific data.
 */
async function getProfile(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.role,
      u.created_at,
      -- Customer specific
      cp.company_name,
      cp.vat_number,
      cp.address,
      cp.tel,
      -- Driver specific
      dp.vehicle_info,
      dp.active AS is_active_driver,
      dp.current_orders
    FROM USERS u
    LEFT JOIN CUSTOMER_PROFILES cp ON u.user_id = cp.user_id
    LEFT JOIN DRIVER_PROFILES dp ON u.user_id = dp.user_id
    WHERE u.user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length) {
    throw new Error('User not found');
  }

  const profile = rows[0];

  // Logic to clean the object based on the user's role
  // This ensures the frontend receives a predictable, clean schema.
  if (profile.role === 'customer') {
    return {
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      created_at: profile.created_at,
      company_name: profile.company_name,
      vat_number: profile.vat_number,
      address: profile.address,
      tel: profile.tel
    };
  } 
  
  if (profile.role === 'driver') {
    return {
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      created_at: profile.created_at,
      vehicle_info: profile.vehicle_info,
      is_active_driver: Boolean(profile.is_active_driver),
      current_orders: profile.current_orders || 0
    };
  }

  // Fallback for admin or other roles without specific profiles
  return {
    user_id: profile.user_id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    created_at: profile.created_at
  };
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

async function updateDriverProfile(userId, vehicleInfo) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Päivitetään ajoneuvotiedot. 
    // ON DUPLICATE KEY UPDATE varmistaa, että profiili päivittyy vaikka INSERT epäonnistuisi.
    await connection.query(
      `
      INSERT INTO DRIVER_PROFILES (user_id, vehicle_info, active)
      VALUES (?, ?, TRUE)
      ON DUPLICATE KEY UPDATE
        vehicle_info = VALUES(vehicle_info)
      `,
      [userId, vehicleInfo || null]
    );

    await connection.commit();
    
    // Palautetaan päivitetty profiili
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
  updateDriverProfile
};

/**
 * @fileoverview User Controller.
 * Handles user management (CRUD) for the admin interface.
 */

import * as userService from '../services/userService.js';
import bcrypt from 'bcrypt';

// Dictionary mapping frontend roles (Finnish) to database enums (English)
const roleToDB = {
  Asiakas: 'customer',
  Kuljettaja: 'driver',
  Admin: 'admin',
  Varasto: 'admin',
};

const dbToRole = {
  customer: 'Asiakas',
  driver: 'Kuljettaja',
  admin: 'Admin',
};

export async function getUsers(req, res) {
  try {
    const rawUsers = await userService.getAllUsers();

    const formattedUsers = rawUsers.map((u) => ({
      original_id: u.user_id,
      id: `U-${u.user_id.toString().padStart(3, '0')}`,
      name: u.full_name,
      email: u.email,
      role: dbToRole[u.role] || 'Asiakas',
      lastLogin: u.last_login
        ? new Date(u.last_login).toLocaleString('fi-FI')
        : 'Ei koskaan',
      tier:
        u.role === 'customer'
          ? u.tier
            ? u.tier.charAt(0).toUpperCase() + u.tier.slice(1)
            : 'Starter'
          : null,
      activeOrders: u.role === 'driver' ? u.current_orders || 0 : null,
      vehicleInfo: u.role === 'driver' ? u.vehicle_info || null : null,
    }));

    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({error: 'Failed to fetch users'});
  }
}

export async function createUser(req, res) {
  try {
    const {name, email, password, role, tier, vehicleInfo} = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({error: 'Missing required fields'});
    }

    const dbRole = roleToDB[role] || 'customer';
    const dbTier = tier ? tier.toLowerCase() : 'starter';

    if (dbRole === 'admin') {
      return res
        .status(403)
        .json({error: 'Admin-käyttäjiä ei voi luoda tästä käyttöliittymästä'});
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUserId = await userService.createUserTransaction(
      name,
      email,
      passwordHash,
      dbRole,
      dbTier,
      vehicleInfo
    );

    res
      .status(201)
      .json({message: 'User created successfully', user_id: newUserId});
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({error: 'Email already exists'});
    }
    res.status(500).json({error: 'Failed to create user'});
  }
}

export async function updateUser(req, res) {
  try {
    const {id} = req.params;
    const {name, email, password, role, tier, vehicleInfo} = req.body;

    const dbRole = roleToDB[role] || 'customer';
    const dbTier = tier ? tier.toLowerCase() : 'starter';

    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({error: 'User not found'});
    }

    if (existingUser.role === 'admin') {
      return res.status(403).json({error: 'Admin-käyttäjiä ei voi muokata'});
    }

    if (dbRole === 'admin') {
      return res.status(403).json({error: 'Admin-roolia ei voi asettaa tässä'});
    }

    let passwordHash = null;
    if (password) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    const updated = await userService.updateUserTransaction(
      id,
      name,
      email,
      passwordHash,
      dbRole,
      dbTier,
      vehicleInfo
    );

    if (!updated) {
      return res.status(404).json({error: 'User not found'});
    }

    res.json({message: 'User updated successfully'});
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({error: 'Email already exists'});
    }
    res.status(500).json({error: 'Failed to update user'});
  }
}

export async function deleteUser(req, res) {
  try {
    const {id} = req.params;

    // SECURE: Fetch user first to check their role before deletion
    const existingUser = await userService.getUserById(id);

    if (!existingUser) {
      return res.status(404).json({error: 'User not found'});
    }

    // SECURE: Prevent deletion if the target is an admin
    if (existingUser.role === 'admin') {
      return res.status(403).json({error: 'Admin-käyttäjiä ei voi poistaa'});
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({error: 'User not found'});
    }

    res.json({message: 'User deleted successfully'});
  } catch (err) {
    res
      .status(500)
      .json({error: 'Failed to delete user. Check active orders.'});
  }
}

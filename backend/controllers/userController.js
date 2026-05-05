const userService = require('../services/userService');
const bcrypt = require('bcrypt');

// Sanakirja frontendin (Suomi) ja tietokannan (Englanti) roolien välille
const roleToDB = {
  Asiakas: 'customer',
  Kuljettaja: 'driver',
  Admin: 'admin',
  Varasto: 'admin', // Huom: DB:ssä ei ollut 'warehouse' roolia, joten mapataan adminiksi (tai voit päivittää DB:n ENUMia)
};

const dbToRole = {
  customer: 'Asiakas',
  driver: 'Kuljettaja',
  admin: 'Admin',
};

async function getUsers(req, res) {
  try {
    const rawUsers = await userService.getAllUsers();

    // Muotoillaan data tismalleen sellaiseksi kuin frontendin UsersPage.tsx odottaa
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
    console.error('Error fetching users:', err);
    res.status(500).json({error: 'Failed to fetch users'});
  }
}

async function createUser(req, res) {
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

    // Salasanan hajautus (Bcrypt)
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
    console.error('Error creating user:', err);
    res.status(500).json({error: 'Failed to create user'});
  }
}

async function updateUser(req, res) {
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
    console.error('Error updating user:', err);
    res.status(500).json({error: 'Failed to update user'});
  }
}

async function deleteUser(req, res) {
  try {
    const {id} = req.params;
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({error: 'User not found'});
    }

    res.json({message: 'User deleted successfully'});
  } catch (err) {
    // Jos käyttäjällä on tilauksia (foreign key constraint), tietokanta voi estää poiston riippuen rakenteesta.
    console.error('Error deleting user:', err);
    res
      .status(500)
      .json({error: 'Failed to delete user. Check active orders.'});
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};

const authService = require('../services/authService.js');
const jwt = require('jsonwebtoken'); // To verify and issue the new token

async function register(req, res) {
  try {
    const {email, password, role, ...extraData} = req.body;

    const result = await authService.register({
      email,
      password,
      role,
      extraData,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('REGISTER CONTROLLER ERROR:', err);

    res.status(400).json({
      error: err.message || 'Registration failed',
    });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
}

async function getProfile(req, res) {
  try {
    const profile = await authService.getProfile(req.user.user_id);
    res.json({success: true, profile});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

async function updateProfile(req, res) {
  try {
    const profile = await authService.updateProfile(
      req.user.user_id,
      req.body || {}
    );
    res.json({success: true, profile});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

async function changePassword(req, res) {
  try {
    const {currentPassword, newPassword} = req.body || {};
    await authService.changePassword(
      req.user.user_id,
      currentPassword,
      newPassword
    );
    res.json({success: true});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

async function refresh(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({success: false, message: 'No token provided'});
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_secret';

    // Verifies the token (ignoreExpiration is true so we can refresh a token that just expired)
    const decoded = jwt.verify(token, secret, {ignoreExpiration: true});

    // Generates a fresh token with a new lifespan (e.g., 24 hours)
    const newToken = jwt.sign(
      {user_id: decoded.user_id, role: decoded.role},
      secret,
      {expiresIn: '24h'}
    );

    return res.json({success: true, token: newToken});
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing token',
      error: error.message,
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refresh,
};

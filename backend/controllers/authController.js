const authService = require('../services/authService.js');

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
    const profile = await authService.updateProfile(req.user.user_id, req.body || {});
    res.json({success: true, profile});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

async function changePassword(req, res) {
  try {
    const {currentPassword, newPassword} = req.body || {};
    await authService.changePassword(req.user.user_id, currentPassword, newPassword);
    res.json({success: true});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};

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
  console.log(req.body);

  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
}
  

// Make sure all error handling returns same form of error (error: err.message)

module.exports = {register, login};

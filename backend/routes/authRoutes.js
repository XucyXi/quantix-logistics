const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.get('/profile', authMiddleware.authenticate, authController.getProfile);
router.put(
  '/profile',
  authMiddleware.authenticate,
  authController.updateProfile
);

// Kuskin profiilipäivitys (Vehicle info)
router.put(
  '/profile/driver',
  authMiddleware.authenticate,
  authController.updateDriverProfile
);

router.put(
  '/change-password',
  authLimiter,
  authMiddleware.authenticate,
  authController.changePassword
);
router.get('/test', (req, res) => {
  res.json({
    message: 'Server works',
    url: req.url,
    method: req.method,
  });
});

module.exports = router;

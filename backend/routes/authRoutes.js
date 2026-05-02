const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/profile', authMiddleware.authenticate, authController.getProfile);
router.put(
  '/profile',
  authMiddleware.authenticate,
  authController.updateProfile
);
router.put(
  '/change-password',
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

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/test', (req, res) => {
    console.log('TEST ROUTE HIT');
    res.json({
        message: 'Server works',
        url: req.url,
        method: req.method
    });
});


module.exports = router;
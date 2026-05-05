const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const settingsController = require('../controllers/settingsController');
const adminController = require('../controllers/adminController'); // <-- Dashboardin uusi kontrolleri

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware.authenticate);
router.use(roleMiddleware.requireRole('admin'));

// ==========================================
// (Analytiikka ja Asetukset)
// ==========================================
router.get('/analytics/revenue', analyticsController.getRevenueStats);
router.get('/analytics/orders', analyticsController.getOrderStats);
router.put('/settings/system', settingsController.updateSystemSettings);
router.post('/settings/smtp/test', settingsController.testSmtp);

// ==========================================
// (Admin Dashboard / Ajokeskus)
// ==========================================
router.get('/routes/overview', adminController.getRoutesOverview);
router.get('/notifications', adminController.getNotifications);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

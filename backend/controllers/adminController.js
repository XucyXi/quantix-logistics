const adminService = require('../services/adminService');

exports.getRoutesOverview = async (req, res) => {
  try {
    const routes = await adminService.getRoutesOverview();
    res.json({success: true, routes});
  } catch (error) {
    console.error('Virhe reittien haussa:', error);
    res
      .status(500)
      .json({success: false, message: 'Server error fetching routes'});
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const {announcements, alerts} = await adminService.getSystemNotifications();
    res.json({
      success: true,
      announcements,
      notifications: alerts,
    });
  } catch (error) {
    console.error('Virhe ilmoitusten haussa:', error);
    res
      .status(500)
      .json({success: false, message: 'Server error fetching notifications'});
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const stats = await adminService.getBasicAnalytics();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Virhe analytiikan haussa:', error);
    res
      .status(500)
      .json({success: false, message: 'Server error fetching analytics'});
  }
};

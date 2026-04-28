const deliveryService = require('../services/deliveryService');

exports.updateLocation = async (req, res) => {
  try {
    const {orderId} = req.params;
    const {latitude, longitude, status} = req.body;

    const result = await deliveryService.createTrackingPoint(orderId, {
      latitude,
      longitude,
      status,
    });

    res.status(201).json({success: true, data: result});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

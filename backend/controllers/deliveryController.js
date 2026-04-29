const deliveryService = require('../services/deliveryService');

exports.updateLocation = async (req, res) => {
  console.log('Body:', req.body);
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

exports.getMyActiveDeliveries = async (req, res) => {
  try {
    const driverId = req.user.user_id; // Saadaan authMiddlewaresta (tokenista)

    // Haetaan tilaukset, jotka on osoitettu tälle kuskille eikä ole vielä valmiita
    // (tai voit hakea myös valmiit, jos haluat näyttää ne listassa)
    const orders = await db.query(
      `SELECT
    order_id AS id,
    'Asiakas #' || customer_id AS store,
    delivery_address AS address,
    status,
    notes AS contact, -- Hyödynnetään notes-kenttää testimielessä
    DATE_FORMAT(scheduled_delivery, '%H:%i') AS eta,
    10 AS boxes -- Tälle ei ollut kenttää, laitetaan placeholder
   FROM orders
   WHERE driver_id = ? AND status != 'done'`,
      [driverId]
    );

    res.json(orders);
  } catch (error) {
    res.status(500).json({message: 'Virhe tilausten haussa'});
  }
};

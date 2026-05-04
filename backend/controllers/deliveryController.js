// backend/controllers/deliveryController.js

const deliveryService = require('../services/deliveryService');
const orderService = require('../services/orderService');
const db = require('../config/db'); // Lisätty tämä, koska käytit getMyActiveDeliveries -funktiossa db.querya

exports.updateLocation = async (req, res) => {
  // console.log('Body:', req.body);
  try {
    const {orderId} = req.params;
    const {latitude, longitude} = req.body;

    const result = await deliveryService.createTrackingPoint(orderId, {
      latitude,
      longitude,
    });

    res.status(201).json({success: true, data: result});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

exports.getMyActiveDeliveries = async (req, res) => {
  try {
    const driverId = req.user.user_id;
    const [orders] = await db.execute(
      // Muutettu query -> execute, ja puretaan taulukosta
      `SELECT
        order_id AS id,
        CONCAT('Asiakas #', customer_id) AS store,
        delivery_address AS address,
        status,
        notes AS contact,
        DATE_FORMAT(ordered_at, '%H:%i') AS eta,
        10 AS boxes
       FROM orders
       WHERE driver_id = ? AND status != 'done'`,
      [driverId]
    );

    res.json(orders);
  } catch (error) {
    console.error('Virhe tilausten haussa:', error);
    res.status(500).json({message: 'Virhe tilausten haussa'});
  }
};

exports.getTrackingData = async (req, res) => {
  // KORJATTU: Luetaan "orderId" reitistä, koska router.get('/:orderId/status')
  const {orderId} = req.params;
  const customerId = req.user.user_id;

  try {
    // 1. Haetaan asiakkaan tilaukset
    const orders = await orderService.getOrdersByCustomerId(customerId);

    // 2. Etsitään oikea tilaus
    const currentOrder = orders.find((o) => o.order_id == orderId);

    if (!currentOrder) {
      return res
        .status(404)
        .json({error: 'Tilausta ei löydy tai se ei kuulu sinulle'});
    }

    // 3. Haetaan kuskin tuorein sijainti (saattaa palauttaa null, jos kuski ei ole lähettänyt vielä mitään)
    const driverLocation = await deliveryService.getLatestLocation(orderId);

    // Palautetaan data frontendille
    res.json({
      status: currentOrder.status,
      destination: {
        // HUOM! Olettaa, että orders-taulussasi on oikeasti dest_lat ja dest_lng.
        // Jos ei ole, nämä palauttavat 0, jolloin kartta piirtää pelkän kuskin sijainnin.
        lat: currentOrder.dest_lat || 0,
        lng: currentOrder.dest_lng || 0,
      },
      driver: driverLocation || null, // Voi olla null, jolloin frontend näyttää latausikonin
    });
  } catch (error) {
    console.error('Tracking haku kaatui:', error);
    res.status(500).json({error: error.message});
  }
};

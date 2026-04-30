const pool = require('../config/db.js');

/**
 * Notification Service
 * Huolehtii asiakkaiden notifikaatioista: email, SMS, in-app
 */

// 📧 Lähetä sähköpostilla
const sendEmailNotification = async (email, subject, message) => {
  try {
    // TODO: Integrointi email-palveluun (Sendgrid, Nodemailer, jne)
    console.log(`📧 Email sent to ${email}: ${subject}`);
    console.log(`Message: ${message}`);

    // Placeholder - korvaa oikealla email-implementaatiolla
    // Esim. Sendgrid:
    // const sgMail = require('@sendgrid/mail');
    // await sgMail.send({to: email, from: 'noreply@quantix.fi', subject, html: message});
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error.message);
  }
};

// 📱 Lähetä SMS
const sendSmsNotification = async (phone, message) => {
  try {
    // TODO: Integrointi SMS-palveluun (Twilio, jne)
    console.log(`📱 SMS sent to ${phone}: ${message}`);

    // Placeholder - korvaa oikealla SMS-implementaatiolla
    // Esim. Twilio:
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({body: message, from: '+358...', to: phone});
  } catch (error) {
    console.error(`Failed to send SMS to ${phone}:`, error.message);
  }
};

// 🔔 In-app notifikaatio (tietokantaan)
const createInAppNotification = async (
  userId,
  title,
  message,
  type = 'info'
) => {
  try {
    if (!userId) {
      throw new Error('userId is required');
    }
    const [result] = await pool.query(
      `INSERT INTO NOTIFICATIONS (user_id, title, message, type, created_at, read_at)
       VALUES (?, ?, ?, ?, NOW(), NULL)`,
      [userId, title, message, type]
    );
    return result;
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
    return null;
  }
};

// 📦 Order status muuttui
const notifyOrderStatusChange = async (order, newStatus, userDetails) => {
  try {
    if (!order || !order.order_id || !userDetails) {
      throw new Error(
        'Missing required parameters: order, newStatus, userDetails'
      );
    }
    const {user_id, order_id, delivery_address} = order;
    const {email, phone, name} = userDetails;

    const statusMessages = {
      pending: {
        title: '📋 Tilaus vastaanotettu',
        message: `Tilaus #${order_id} on vastaanotettu. Osoite: ${delivery_address}`,
        type: 'info',
      },
      confirmed: {
        title: '✅ Tilaus vahvistettu',
        message: `Tilaus #${order_id} on vahvistettu. Kuljettaja määrätään pian.`,
        type: 'success',
      },
      in_transit: {
        title: '🚚 Toimitus on matkalla',
        message: `Kuljettaja on lähdössä osoitteeseen ${delivery_address}`,
        type: 'warning',
      },
      delivered: {
        title: '✨ Tilaus toimitettu!',
        message: `Tilaus #${order_id} on toimitettu. Kiitos ostoksestasi!`,
        type: 'success',
      },
      cancelled: {
        title: '❌ Tilaus peruutettu',
        message: `Tilaus #${order_id} on peruutettu. Ota yhteyttä asiakaspalveluun.`,
        type: 'error',
      },
    };

    const notification = statusMessages[newStatus] || {
      title: 'Tilauksen tila muuttui',
      message: `Tilaus #${order_id} tila: ${newStatus}`,
      type: 'info',
    };

    // 1. Tallenna in-app notification
    await createInAppNotification(
      user_id,
      notification.title,
      notification.message,
      notification.type
    );

    // 2. Lähetä sähköposti
    if (email) {
      await sendEmailNotification(
        email,
        notification.title,
        `Hei ${name},\n\n${notification.message}\n\nTilausnumero: #${order_id}\n\nOsoite: ${delivery_address}\n\nYstävällisin terveisin,\nQuantix Logistics`
      );
    }

    // 3. Lähetä SMS (jos saatavilla)
    if (phone && (newStatus === 'in_transit' || newStatus === 'delivered')) {
      await sendSmsNotification(
        phone,
        `${notification.title} - Tilaus #${order_id}. Seuraa: ${newStatus === 'in_transit' ? 'Kuljettaja on lähdössä' : 'Tilaus toimitettu!'}`
      );
    }

    console.log(
      `✅ Notifications sent for order #${order_id} - Status: ${newStatus}`
    );
    return true;
  } catch (error) {
    console.error('Error in notifyOrderStatusChange:', error.message);
    return false;
  }
};

// 📦 Order luotu
const notifyOrderCreated = async (order, userDetails) => {
  try {
    if (!order || !order.order_id || !userDetails) {
      throw new Error('Missing required parameters: order, userDetails');
    }
    const {user_id, order_id, total_price, delivery_address} = order;
    const {email, name} = userDetails;

    // In-app notification
    await createInAppNotification(
      user_id,
      '📋 Uusi tilaus luotu',
      `Tilaus #${order_id} on luotu. Hinta: €${total_price}`,
      'info'
    );

    // Email notification
    if (email) {
      await sendEmailNotification(
        email,
        '📋 Tilaus vastaanotettu',
        `Hei ${name},\n\nKiitos tilauksestasi! Tilausnumero: #${order_id}\nHinta: €${total_price}\nOsoite: ${delivery_address}\n\nSeuraa tilauksen kulkua portaalissa.\n\nYstävällisin terveisin,\nQuantix Logistics`
      );
    }

    console.log(`✅ Order created notification sent for order #${order_id}`);
    return true;
  } catch (error) {
    console.error('Error in notifyOrderCreated:', error.message);
    return false;
  }
};

// 👨‍💼 Admin notifikaatio - uusi tilaus
const notifyAdminNewOrder = async (order, itemCount) => {
  try {
    const {order_id, customer_id, total_price, delivery_address} = order;

    // Hae kaikki adminit
    const [admins] = await pool.query(
      `SELECT user_id, email, name FROM USERS WHERE role = 'admin'`
    );

    for (let admin of admins) {
      // In-app notification
      await createInAppNotification(
        admin.user_id,
        `📦 Uusi tilaus: #${order_id}`,
        `Asiakas #${customer_id} teki tilauksen €${total_price}. Items: ${itemCount}. Osoite: ${delivery_address}`,
        'warning'
      );

      // Email notification
      await sendEmailNotification(
        admin.email,
        `🚨 Uusi tilaus: #${order_id}`,
        `Hei ${admin.name},\n\nUusi tilaus vaatii huomiotasi!\n\nTilausnumero: #${order_id}\nAsiakas: #${customer_id}\nHinta: €${total_price}\nItems: ${itemCount}\nOsoite: ${delivery_address}\n\nKirjaudu hallinnointipaneeliin.\n\nYstävällisin terveisin,\nQuantix System`
      );
    }

    console.log(`✅ Admin notifications sent for new order #${order_id}`);
    return true;
  } catch (error) {
    console.error('Error in notifyAdminNewOrder:', error.message);
    return false;
  }
};

// 👨‍🚗 Driver notifikaatio - uusi tilaus määrätty
const notifyDriverAssignment = async (driverId, order, driverDetails) => {
  try {
    const {order_id, delivery_address, total_price} = order;
    const {email, name, phone} = driverDetails;

    // In-app notification
    await createInAppNotification(
      driverId,
      '🚚 Uusi tilaus määrätty',
      `Tilaus #${order_id} on määrätty sinulle. Osoite: ${delivery_address}`,
      'warning'
    );

    // Email notification
    if (email) {
      await sendEmailNotification(
        email,
        '🚚 Uusi toimitus sinulle',
        `Hei ${name},\n\nSinulle on määrätty uusi toimitus!\n\nTilausnumero: #${order_id}\nOsoite: ${delivery_address}\nArvo: €${total_price}\n\nAvaa sovellus nähdäksesi kartan ja ohjeet.\n\nYstävällisin terveisin,\nQuantix Dispatch`
      );
    }

    // SMS notification
    if (phone) {
      await sendSmsNotification(
        phone,
        `🚚 Uusi toimitus: Tilaus #${order_id}. Osoite: ${delivery_address}`
      );
    }

    console.log(`✅ Driver notifications sent for order #${order_id}`);
    return true;
  } catch (error) {
    console.error('Error in notifyDriverAssignment:', error.message);
    return false;
  }
};

// Hae käyttäjän notifikaatiot
const getUserNotifications = async (userId, limit = 20) => {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM NOTIFICATIONS
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error.message);
    throw error;
  }
};

// Merkitse notifikaatio luetuksi
const markNotificationAsRead = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('notificationId is required');
    }
    const result = await pool.query(
      `UPDATE NOTIFICATIONS SET read_at = NOW() WHERE notification_id = ?`,
      [notificationId]
    );
    return result;
  } catch (error) {
    console.error('Failed to mark notification as read:', error.message);
    return null;
  }
};

module.exports = {
  sendEmailNotification,
  sendSmsNotification,
  createInAppNotification,
  notifyOrderStatusChange,
  notifyOrderCreated,
  notifyAdminNewOrder,
  notifyDriverAssignment,
  getUserNotifications,
  markNotificationAsRead,
};

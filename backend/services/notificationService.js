/**
 * @fileoverview Notification Service.
 * Manages in-app notifications and simulates SMS/Email dispatching.
 */

import pool from '../config/db.js';

/**
 * Simulates sending an email notification.
 * @param {string} email - Recipient email.
 * @param {string} subject - Email subject.
 * @param {string} message - Email body.
 */
export const sendEmailNotification = async (email, subject, message) => {
  try {
    console.log(`\n==========================================`);
    console.log(`✉️  SIMULOITU SÄHKÖPOSTI LÄHETETTY`);
    console.log(`Vastaanottaja: ${email}`);
    console.log(`Otsikko: ${subject}`);
    console.log(`------------------------------------------`);
    console.log(`${message}`);
    console.log(`==========================================\n`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error.message);
  }
};

/**
 * Simulates sending an SMS notification.
 * @param {string} phone - Recipient phone number.
 * @param {string} message - SMS body.
 */
export const sendSmsNotification = async (phone, message) => {
  try {
    if (!phone) return;
    console.log(`\n📱 SIMULOITU TEKSTIVIESTI -> ${phone}:`);
    console.log(`"${message}"\n`);
  } catch (error) {
    console.error(`Failed to send SMS to ${phone}:`, error.message);
  }
};

/**
 * Creates an in-app notification in the database.
 */
export const createInAppNotification = async (
  userId,
  title,
  message,
  type = 'info'
) => {
  try {
    if (!userId) throw new Error('userId is required');

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

/**
 * Notifies a customer about a change in their order's status.
 */
export const notifyOrderStatusChange = async (
  order,
  newStatus,
  userDetails
) => {
  try {
    if (!order || !order.order_id || !userDetails) return false;

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

    await createInAppNotification(
      user_id,
      notification.title,
      notification.message,
      notification.type
    );

    if (email) {
      await sendEmailNotification(
        email,
        notification.title,
        `Hei ${name || 'Asiakas'},\n\n${notification.message}\n\nTilausnumero: #${order_id}\n\nYstävällisin terveisin,\nQuantix Logistics`
      );
    }

    if (phone && (newStatus === 'in_transit' || newStatus === 'delivered')) {
      await sendSmsNotification(
        phone,
        `${notification.title} - Tilaus #${order_id}.`
      );
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Notifies the customer that their order was successfully created.
 */
export const notifyOrderCreated = async (order, userDetails) => {
  try {
    const {user_id, order_id, total_price, delivery_address} = order;
    const {email, name} = userDetails;

    await createInAppNotification(
      user_id,
      '📋 Uusi tilaus luotu',
      `Tilaus #${order_id} on luotu. Hinta: €${total_price}`,
      'info'
    );

    if (email) {
      await sendEmailNotification(
        email,
        '📋 Tilaus vastaanotettu',
        `Hei ${name || 'Asiakas'},\n\nKiitos tilauksestasi! Tilausnumero: #${order_id}\n\nYstävällisin terveisin,\nQuantix Logistics`
      );
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Notifies all admins when a new order is placed.
 */
export const notifyAdminNewOrder = async (order, itemCount) => {
  try {
    const {order_id, customer_id, total_price, delivery_address} = order;
    const [admins] = await pool.query(
      `SELECT user_id, email, full_name AS name FROM USERS WHERE role = 'admin'`
    );

    for (let admin of admins) {
      await createInAppNotification(
        admin.user_id,
        `📦 Uusi tilaus: #${order_id}`,
        `Asiakas #${customer_id} teki tilauksen €${total_price}.`,
        'warning'
      );
      await sendEmailNotification(
        admin.email,
        `🚨 Uusi tilaus: #${order_id}`,
        `Hei ${admin.name},\n\nUusi tilaus vaatii huomiotasi!\nTilausnumero: #${order_id}\n\nQuantix System`
      );
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Notifies a driver that they have been assigned a new delivery.
 */
export const notifyDriverAssignment = async (
  driverId,
  order,
  driverDetails
) => {
  try {
    const {order_id, delivery_address, total_price} = order;
    const {email, name, phone} = driverDetails;

    await createInAppNotification(
      driverId,
      '🚚 Uusi tilaus määrätty',
      `Tilaus #${order_id} on määrätty sinulle. Osoite: ${delivery_address}`,
      'warning'
    );

    if (email) {
      await sendEmailNotification(
        email,
        '🚚 Uusi toimitus sinulle',
        `Hei ${name || 'Kuljettaja'},\n\nSinulle on määrätty uusi toimitus!\nTilausnumero: #${order_id}\nOsoite: ${delivery_address}\n\nQuantix Dispatch`
      );
    }
    if (phone) {
      await sendSmsNotification(
        phone,
        `🚚 Uusi toimitus: Tilaus #${order_id}. Osoite: ${delivery_address}`
      );
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Fetches notifications for a specific user.
 */
export const getUserNotifications = async (userId, limit = 20) => {
  const [notifications] = await pool.query(
    `SELECT * FROM NOTIFICATIONS WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return notifications;
};

/**
 * Marks a specific notification as read.
 */
export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) throw new Error('notificationId is required');
  const result = await pool.query(
    `UPDATE NOTIFICATIONS SET read_at = NOW() WHERE notification_id = ?`,
    [notificationId]
  );
  return result;
};

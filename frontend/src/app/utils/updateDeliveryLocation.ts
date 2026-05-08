/**
 * @fileoverview Delivery Location Updater.
 * Note: This functionality is also implemented in `orderService.ts`.
 * Consider removing this file and using `orderService.updateDeliveryLocation` to keep the codebase DRY.
 */

import api from '../lib/api';

/**
 * Sends the driver's current GPS coordinates to the backend.
 *
 * @param orderId - The ID of the active order.
 * @param latitude - Driver's current latitude.
 * @param longitude - Driver's current longitude.
 */
export const updateDeliveryLocation = async (
  orderId: number,
  latitude: number,
  longitude: number
) => {
  try {
    // Using the global API instance automatically handles Auth headers and token refreshes
    await api.post(`/deliveries/${orderId}/location`, {
      latitude,
      longitude,
      status: 'in_transit',
      updated_at: new Date().toISOString(),
    });

    console.log(
      `[Location Update] Order ${orderId}: ${latitude}, ${longitude}`
    );
  } catch (error) {
    console.error('Error sending location to backend:', error);
  }
};

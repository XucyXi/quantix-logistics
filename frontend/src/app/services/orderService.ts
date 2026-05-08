/**
 * @fileoverview Order Service.
 * Comprehensive service handling order creation, retrieval, updates, and tracking
 * across Customer, Driver, and Admin roles.
 */

import api from '../lib/api';

export interface BackendOrder {
  order_id: number;
  customerName: string;
  driverName?: string | null;
  items_count: number;
  total_price: string | number;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'ready_for_pickup'
    | 'in_transit'
    | 'done'
    | 'stuck'
    | 'cancelled';
  ordered_at: string;
  delivery_address: string;
  notes: string | null;
  driver_id: number | null;
}

export interface CursorResponse {
  success: boolean;
  orders: BackendOrder[];
  nextCursor: number | null;
}

export interface TrackingData {
  status: string;
  destination: {lat: number; lng: number};
  driver: {latitude: number; longitude: number; updated_at: string} | null;
}

export const orderService = {
  // ==========================================
  // SHARED & GENERAL
  // ==========================================

  /**
   * Retrieves a paginated list of orders using cursor-based pagination.
   */
  getOrdersCursor: async (
    cursor: number | string = 0,
    limit: number = 16
  ): Promise<CursorResponse> => {
    const res = await api.get(`/orders/cursor?cursor=${cursor}&limit=${limit}`);
    return res.data;
  },

  /**
   * Creates a new order with items.
   */
  createOrder: async (orderData: {
    delivery_address: string;
    notes: string;
    items: {product_id: number; quantity: number}[];
  }) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  /**
   * Retrieves a single order's details by its ID.
   */
  getOrderById: async (orderId: number, token?: string) => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get(`/orders/${orderId}`, config);
    return res.data;
  },

  // ==========================================
  // ADMIN FUNCTIONS
  // ==========================================

  /**
   * Retrieves all orders for the admin dashboard.
   */
  getAllOrdersAdmin: async (): Promise<BackendOrder[]> => {
    const res = await api.get('/orders/admin/all');
    return res.data;
  },

  /**
   * Retrieves live tracking locations for all active deliveries (Admin map).
   */
  getAllActiveTracking: async (token?: string) => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get('/deliveries/active', config);
    return res.data;
  },

  /**
   * Assigns a specific driver to an order.
   */
  assignDriver: async (orderId: number, driverId: number | null) => {
    const res = await api.put(`/orders/${orderId}/assign`, {
      driver_id: driverId,
    });
    return res.data;
  },

  /**
   * Cancels a pending order and restores stock.
   */
  cancelOrder: async (orderId: number) => {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
  },

  /**
   * Retrieves a list of all drivers in the system.
   */
  getAllDrivers: async () => {
    const res = await api.get('/orders/admin/drivers');
    return res.data;
  },

  // ==========================================
  // DRIVER FUNCTIONS
  // ==========================================

  /**
   * Retrieves all active orders assigned to the authenticated driver.
   */
  getAssignedOrders: async () => {
    const res = await api.get('/orders/driver/assigned');
    return res.data;
  },

  /**
   * Updates the progression status of an order (e.g., in_transit, done).
   */
  updateOrderStatus: async (orderId: number, newStatus: string) => {
    const res = await api.put(`/orders/${orderId}/status`, {newStatus});
    return res.data;
  },

  /**
   * Toggles the active/inactive working state of the driver.
   */
  updateAvailability: async (active: boolean) => {
    const res = await api.put('/orders/driver/availability', {active});
    return res.data;
  },

  /**
   * Pushes the driver's current GPS location for an active delivery.
   */
  updateDeliveryLocation: async (
    orderId: number,
    location: {latitude: number; longitude: number}
  ) => {
    const res = await api.post(`/deliveries/${orderId}/location`, location);
    return res.data;
  },

  // ==========================================
  // CUSTOMER FUNCTIONS
  // ==========================================

  /**
   * Retrieves the authenticated customer's order history with optional filtering.
   */
  getCustomerOrders: async (
    params?: {limit?: number; offset?: number; status?: string},
    token?: string
  ) => {
    const config = token
      ? {headers: {Authorization: `Bearer ${token}`}, params}
      : {params};
    const res = await api.get('/orders/customer/all', config);
    return res.data;
  },

  /**
   * Retrieves aggregate order statistics for the customer dashboard.
   */
  getOrderStats: async (token?: string) => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get('/orders/customer/stats', config);
    return res.data;
  },

  /**
   * Fetches real-time tracking data (driver location & destination) for a specific order.
   */
  getTrackingData: async (
    orderId: number,
    token?: string
  ): Promise<TrackingData> => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get(`/deliveries/${orderId}/status`, config);
    return res.data;
  },
};

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
  driver: {latitude: number; longitude: number; updated_at: string};
}

export const orderService = {
  // --- ADMIN & YLEISET ---
  getOrdersCursor: async (
    cursor: number | string = 0,
    limit: number = 16
  ): Promise<CursorResponse> => {
    const res = await api.get(`/orders/cursor?cursor=${cursor}&limit=${limit}`);
    return res.data;
  },

  getAllOrdersAdmin: async (): Promise<BackendOrder[]> => {
    const res = await api.get('/orders/admin/all');
    return res.data;
  },

  // Hakee kaikkien liikkeellä olevien kuskien sijainnit
  getAllActiveTracking: async (token?: string) => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get('/deliveries/active', config);
    return res.data;
  },

  // --- KULJETTAJAN FUNKTIOITA ---
  getAssignedOrders: async () => {
    const res = await api.get('/orders/driver/assigned');
    return res.data;
  },

  updateOrderStatus: async (orderId: number, newStatus: string) => {
    const res = await api.put(`/orders/${orderId}/status`, {newStatus});
    return res.data;
  },

  updateAvailability: async (active: boolean) => {
    const res = await api.put('/orders/driver/availability', {active});
    return res.data;
  },

  updateDeliveryLocation: async (
    orderId: number,
    location: {latitude: number; longitude: number}
  ) => {
    const res = await api.post(`/deliveries/${orderId}/location`, location);
    return res.data;
  },

  // --- ASIAKKAAN FUNKTIOITA ---
  // PÄIVITETTY: Tukee nyt API-dokumentaation mukaisia filttereitä
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

  getOrderStats: async (token?: string) => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get('/orders/customer/stats', config);
    return res.data;
  },

  // --- ADMIN TOIMINNOT ---
  assignDriver: async (orderId: number, driverId: number | null) => {
    const res = await api.put(`/orders/${orderId}/assign`, {
      driver_id: driverId,
    });
    return res.data;
  },

  cancelOrder: async (orderId: number) => {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
  },

  getAllDrivers: async () => {
    const res = await api.get('/orders/admin/drivers');
    return res.data;
  },

  // YLEISET TILAUSTOIMINNOT
  createOrder: async (orderData: {
    delivery_address: string;
    notes: string;
    items: {product_id: number; quantity: number}[];
  }) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  getOrderById: async (orderId: number, token?: string) => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get(`/orders/${orderId}`, config);
    return res.data;
  },

  getTrackingData: async (
    orderId: number,
    token?: string
  ): Promise<TrackingData> => {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await api.get(`/deliveries/${orderId}/status`, config);
    return res.data;
  },
};

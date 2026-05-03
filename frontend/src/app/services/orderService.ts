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

export const orderService = {
  // Hakee KAIKKI tilaukset (Admin-oikeus)
  getAllOrdersAdmin: async (): Promise<BackendOrder[]> => {
    const res = await api.get('/orders/admin/all');
    return res.data;
  },

  // Kuskin määrääminen tilaukselle (Admin-oikeus)
  assignDriver: async (orderId: number, driverId: number | null) => {
    const res = await api.put(`/orders/${orderId}/assign`, {
      driver_id: driverId,
    });
    return res.data;
  },

  // Tilauksen peruuttaminen (Admin-oikeus)
  cancelOrder: async (orderId: number) => {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
  },

  // Tilauksen tekeminen (Asiakas)
  createOrder: async (orderData: {
    delivery_address: string;
    notes: string;
    items: {product_id: number; quantity: number}[];
  }) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
};

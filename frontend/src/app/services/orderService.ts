import api from '../lib/api';

export const orderService = {
  getOrderStats: async () => {
    const res = await api.get('/orders/stats');
    return res.data;
  },

  getCustomerOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },

  getOrderById: async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },

  getAssignedOrders: async () => {
    const res = await api.get('/orders/assigned');
    return res.data;
  },

  updateOrderStatus: async (orderId: number, newStatus: string) => {
    const res = await api.put(`/orders/${orderId}/status`, {newStatus});
    return res.data;
  },
};

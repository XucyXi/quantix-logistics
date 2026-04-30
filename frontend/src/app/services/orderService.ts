export const orderService = {
  getOrderStats: async (token: string) => {
    const res = await fetch('/api/orders/stats', {
      headers: {Authorization: `Bearer ${token}`},
    });
    return res.json();
  },

  getCustomerOrders: async (token: string) => {
    const res = await fetch('/api/orders', {
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});
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

  getOrderById: async (orderId: string, token: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getAssignedOrders: async (token: string) => {
    const res = await fetch('/api/orders/assigned', {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch assigned orders');
    return res.json();
  },

  updateOrderStatus: async (
    orderId: number,
    newStatus: string,
    token: string
  ) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({newStatus}),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },
};

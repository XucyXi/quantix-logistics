export const orderService = {
  getOrderStats: async (token: string) => {
    const res = await fetch('/api/orders/stats', {
      headers: {Authorization: `Bearer ${token}`},
    });
    return res.json();
  },
};

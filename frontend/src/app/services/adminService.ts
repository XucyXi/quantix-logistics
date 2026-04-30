const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const adminService = {
  getAnalytics: async (token: string) => {
    const res = await fetch('/api/admin/analytics/revenue', {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch admin analytics');
    return res.json();
  },

  getActiveRoutes: async (token: string) => {
    // Oletetaan, että backendissä on tämä reitti oppaan mukaisesti
    const res = await fetch('/api/admin/routes/overview', {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch active routes');
    return res.json();
  },

  getNotifications: async (token: string) => {
    const res = await fetch('/api/notifications', {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },
};

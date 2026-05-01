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
    // Backward-compatible fallback while /routes/overview is being implemented.
    const res = await fetch('/api/admin/routes/overview', {
      headers: getAuthHeaders(token),
    });
    if (res.ok) return res.json();

    const fallbackRes = await fetch('/api/admin/analytics/orders', {
      headers: getAuthHeaders(token),
    });
    if (!fallbackRes.ok) throw new Error('Failed to fetch active routes');
    return fallbackRes.json();
  },

  getNotifications: async (token: string) => {
    const res = await fetch('/api/notifications', {
      headers: getAuthHeaders(token),
    });
    if (res.status === 404) {
      return {notifications: []};
    }
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },
};

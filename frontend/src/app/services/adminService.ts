import api from '../lib/api';

export const adminService = {
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics/revenue');
    return res.data;
  },

  getActiveRoutes: async () => {
    // Backward-compatible fallback while /routes/overview is being implemented.
    try {
      const res = await api.get('/admin/routes/overview');
      return res.data;
    } catch {
      // Jos ylempi reitti palauttaa virheen, kokeillaan tätä:
      const fallbackRes = await api.get('/admin/analytics/orders');
      return fallbackRes.data;
    }
  },

  getNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (error: unknown) {
      const axiosError = error as {response?: {status?: number}};

      // Jos reittiä ei löydy (404), palautetaan vain tyhjä taulukko sovelluksen kaatamisen sijaan
      if (axiosError.response && axiosError.response.status === 404) {
        return {notifications: []};
      }
      // Muissa virheissä (esim. 500 Server Error) heitetään virhe eteenpäin
      throw error;
    }
  },
};

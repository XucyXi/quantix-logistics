import api from '../lib/api';

export interface AdminAnnouncement {
  announcement_id: number;
  title: string;
  content?: string | null;
  created_at: string;
  expires_at?: string | null;
}

export const adminService = {
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics/revenue');
    return res.data;
  },

  getOrderAnalytics: async () => {
    const res = await api.get('/admin/analytics/orders');
    return res.data;
  },

  getActiveRoutes: async () => {
    try {
      const res = await api.get('/admin/routes/overview');
      return res.data;
    } catch {
      // Fallback jos overview ei ole vielä implementoitu backendissä
      const fallbackRes = await api.get('/admin/analytics/orders');
      return fallbackRes.data;
    }
  },

  updateSystemSettings: async (settingsData: {
    timezone?: string;
    language?: string;
  }) => {
    const res = await api.put('/admin/settings/system', settingsData);
    return res.data;
  },

  getNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (error: unknown) {
      const axiosError = error as {response?: {status?: number}};
      if (axiosError.response && axiosError.response.status === 404) {
        return {notifications: [], announcements: [], unreadCount: 0};
      }
      throw error;
    }
  },

  createAnnouncement: async (announcementData: {
    title: string;
    content?: string;
    expires_at?: string | null;
  }) => {
    const res = await api.post('/notifications/announcements', announcementData);
    return res.data;
  },
};

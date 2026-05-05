/**
 * @fileoverview Admin Service.
 * Handles API requests for the admin dashboard, including analytics, system settings, and notifications.
 */

import api from '../lib/api';

export interface AdminAnnouncement {
  announcement_id: number;
  title: string;
  content?: string | null;
  created_at: string;
  expires_at?: string | null;
}

export const adminService = {
  /**
   * Retrieves revenue and high-level order statistics for the last 30 days.
   */
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics/revenue');
    return res.data;
  },

  /**
   * Retrieves order statistics grouped by their current status.
   */
  getOrderAnalytics: async () => {
    const res = await api.get('/admin/analytics/orders');
    return res.data;
  },

  /**
   * Retrieves an overview of active routes and drivers.
   * Includes a fallback to order analytics if the specific route endpoint fails.
   */
  getActiveRoutes: async () => {
    try {
      const res = await api.get('/admin/routes/overview');
      return res.data;
    } catch {
      // Fallback in case the overview endpoint is not fully implemented
      const fallbackRes = await api.get('/admin/analytics/orders');
      return fallbackRes.data;
    }
  },

  /**
   * Updates global system settings (e.g., timezone, language).
   */
  updateSystemSettings: async (settingsData: {
    timezone?: string;
    language?: string;
  }) => {
    const res = await api.put('/admin/settings/system', settingsData);
    return res.data;
  },

  /**
   * Retrieves system notifications and active announcements.
   * Returns empty arrays if the endpoint is not found (404).
   */
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

  /**
   * Creates a new system-wide announcement.
   */
  createAnnouncement: async (announcementData: {
    title: string;
    content?: string;
    expires_at?: string | null;
  }) => {
    const res = await api.post(
      '/notifications/announcements',
      announcementData
    );
    return res.data;
  },
};

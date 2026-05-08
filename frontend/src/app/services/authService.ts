/**
 * @fileoverview Authentication & Profile Service.
 * Handles API requests for fetching and updating user profiles, driver vehicle info, and passwords.
 */

import api from '../lib/api';

export const authService = {
  /**
   * Retrieves the profile data of the currently authenticated user.
   */
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  /**
   * Updates the general profile information of the authenticated user.
   */
  updateProfile: async (profileData: {full_name?: string; email?: string}) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },

  /**
   * Updates the vehicle information for a driver profile.
   */
  updateDriverProfile: async (vehicleInfo: string) => {
    const res = await api.put('/auth/profile/driver', {vehicleInfo});
    return res.data;
  },

  /**
   * Changes the authenticated user's password.
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};

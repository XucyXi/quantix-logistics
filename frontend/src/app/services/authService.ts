import api from '../lib/api';

export const authService = {
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  updateProfile: async (profileData: {full_name?: string; email?: string}) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },

  updateDriverProfile: async (vehicleInfo: string) => {
    const res = await api.put('/auth/profile/driver', {vehicleInfo});
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};

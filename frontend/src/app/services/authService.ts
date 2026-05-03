import api from '../lib/api';

export const authService = {
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};

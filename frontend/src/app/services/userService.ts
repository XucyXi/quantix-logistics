/**
 * @fileoverview User Service.
 * Handles API communications for user account management (Admin functionality).
 */

import api from '../lib/api';

export interface User {
  id: string; // Formatted ID for UI, e.g., 'U-001'
  original_id: number; // Actual database user_id
  name: string;
  email: string;
  role: 'Asiakas' | 'Kuljettaja' | 'Varasto' | 'Admin';
  lastLogin: string;
  tier: 'Starter' | 'Pro' | 'Enterprise' | null;
  activeOrders: number | null;
  vehicleInfo?: string | null;
}

export const userService = {
  /**
   * Retrieves all users and their associated profile data.
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  /**
   * Creates a new user.
   * Note: Creation of 'Admin' users is restricted via the backend for security.
   */
  createUser: async (userData: Partial<User>) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Updates an existing user's details and role.
   */
  updateUser: async (userId: number, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Deletes a user from the system.
   */
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

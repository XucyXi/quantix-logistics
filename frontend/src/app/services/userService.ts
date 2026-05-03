import api from '../lib/api';

export interface User {
  id: string; // Tulee olemaan esim. 'U-001' (yhdistetään ID:stä)
  original_id: number; // Tietokannan oikea user_id
  name: string;
  email: string;
  role: 'Asiakas' | 'Kuljettaja' | 'Varasto' | 'Admin';
  lastLogin: string;
  tier: 'Starter' | 'Pro' | 'Enterprise' | null;
  activeOrders: number | null;
}

export const userService = {
  /**
   * Hakee kaikki käyttäjät ja heidän profiilitietonsa backendistä
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  /**
   * Luo uuden käyttäjän
   * Huom! Adminia ei voi luoda tätä kautta turvallisuussyistä.
   */
  createUser: async (userData: Partial<User>) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Päivittää olemassa olevan käyttäjän tiedot
   */
  updateUser: async (userId: number, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Poistaa käyttäjän
   */
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

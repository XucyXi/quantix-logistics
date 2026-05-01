import React, {createContext, useContext, useState} from 'react';
import api from '../lib/api';

export type UserRole = 'customer' | 'admin' | 'driver';
export type UserTier = 'standard' | 'business';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier?: UserTier;
  company?: string;
}

// Apufunktio tarkistaa, onko käyttäjä business-asiakas
export function isBusinessCustomer(user: User | null): boolean {
  return user?.tier === 'business';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  // Luetaan käyttäjä localStoragesta heti alussa, jotta kirjautuminen säilyy sivun päivityksessä.
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('quantix_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      // Jos localStoragen data on rikki, jatketaan turvallisesti ilman käyttäjää.
      return null;
    }
  });

  // Lisään Jwt tokenin
  const [token, setToken] = useState<string | null>(() => {
    return (
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('quantix_token') ||
      null
    );
  });

  const login = async (
    email: string,
    password: string,
    role?: UserRole
  ): Promise<boolean> => {
    try {
      const {data} = await api.post('/auth/login', {email, password});
      const resolvedRole = data.role as UserRole;

      if (role && resolvedRole !== role) {
        return false;
      }

      const tokenValue = data.token as string;
      const userData: User = {
        id: String(data.user_id),
        name: data.name || email.split('@')[0],
        email,
        role: resolvedRole,
      };

      setUser(userData);
      setToken(tokenValue);

      localStorage.setItem('quantix_user', JSON.stringify(userData));
      localStorage.setItem('accessToken', tokenValue);
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('quantix_token', tokenValue);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    // Tyhjennetään sekä React-tila että localStorage, jotta uloskirjautuminen on varma.
    setUser(null);
    setToken(null);
    localStorage.removeItem('quantix_user');
    localStorage.removeItem('quantix_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{user, token, login, logout, isAuthenticated: !!user}}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // Hookia saa käyttää vain providerin sisällä.
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

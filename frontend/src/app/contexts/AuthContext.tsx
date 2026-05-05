/**
 * @fileoverview Authentication Context.
 * Manages global user state, session tokens, and authentication actions (login/logout/refresh).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
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

/**
 * Utility function to check if a user belongs to the business tier.
 */
export function isBusinessCustomer(user: User | null): boolean {
  return user?.tier === 'business';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('quantix_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return (
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('quantix_token') ||
      null
    );
  });

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('quantix_user');
    localStorage.removeItem('quantix_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');

    window.location.href = '/';
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      const currentToken =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('quantix_token');

      // Refresh token only if a session is actively present
      if (currentToken && user) {
        try {
          const {data} = await api.post(
            '/auth/refresh',
            {},
            {
              headers: {Authorization: `Bearer ${currentToken}`},
            }
          );

          if (data.success && data.token) {
            const newToken = data.token;
            setToken(newToken);
            localStorage.setItem('accessToken', newToken);
            localStorage.setItem('token', newToken);
            localStorage.setItem('quantix_token', newToken);
          }
        } catch (error) {
          console.error('Session verification failed, logging out.', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, [logout, user]);

  const login = async (
    email: string,
    password: string,
    role?: UserRole
  ): Promise<boolean> => {
    try {
      const {data} = await api.post('/auth/login', {email, password});
      const resolvedRole = data.role as UserRole;

      // Prevent login if the requested role doesn't match the user's actual role
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

  return (
    <AuthContext.Provider
      value={{user, token, login, logout, isAuthenticated: !!user, isLoading}}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume the AuthContext.
 * Must be used within an <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

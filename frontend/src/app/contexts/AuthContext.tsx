import React, {createContext, useContext, useState, useEffect} from 'react';

export type UserRole = 'customer' | 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demokäyttäjät kirjautumisen testaamiseen ilman backendiä.
const MOCK_USERS: (User & {password: string})[] = [
  {
    id: '1',
    name: 'Matti Virtanen',
    email: 'asiakas@demo.fi',
    password: 'demo123',
    role: 'customer',
  },
  {
    id: '2',
    name: 'Päivi Mäkinen',
    email: 'admin@quantix.fi',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '3',
    name: 'Jukka Leinonen',
    email: 'kuljettaja@quantix.fi',
    password: 'driver123',
    role: 'driver',
  },
];

export function AuthProvider({children}: {children: React.ReactNode}) {
  // Säilytetään käyttäjä localStoragessa, jotta sessio säilyy refreshin yli.
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('quantix_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, password: string, role?: UserRole): boolean => {
    const found = MOCK_USERS.find(
      (u) =>
        u.email === email &&
        u.password === password &&
        (!role || u.role === role)
    );
    if (found) {
      const {password: _, ...userWithoutPassword} = found;
      setUser(userWithoutPassword);
      localStorage.setItem('quantix_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quantix_user');
  };

  return (
    <AuthContext.Provider
      value={{user, login, logout, isAuthenticated: !!user}}
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

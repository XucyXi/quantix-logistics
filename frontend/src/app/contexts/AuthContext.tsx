import React, {createContext, useContext, useState} from 'react';

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
    tier: 'standard',
  },
  {
    id: '2',
    name: 'Yritysasiakas Oy',
    email: 'yritys@demo.fi',
    password: 'business123',
    role: 'customer',
    tier: 'business',
    company: 'Yritysasiakas Oy',
  },
  {
    id: '3',
    name: 'Päivi Mäkinen',
    email: 'admin@quantix.fi',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '4',
    name: 'Jukka Leinonen',
    email: 'kuljettaja@quantix.fi',
    password: 'driver123',
    role: 'driver',
  },
];

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
    return localStorage.getItem('quantix_token') || null;
  });

  const login = (email: string, password: string, role?: UserRole): boolean => {
    // Role on valinnainen: jos roolia ei anneta, hyväksytään mikä tahansa rooli.
    // Paluuarvo boolean pitää kirjautumisformin yksinkertaisena:
    // UI voi näyttää virheen ilman try/catch-rakennetta.
    const found = MOCK_USERS.find(
      (u) =>
        u.email === email &&
        u.password === password &&
        (!role || u.role === role)
    );
    if (found) {
      // Salasanaa ei tallenneta sovelluksen tilaan eikä localStorageen.
      // Nimen vaihto _-muuttujaan dokumentoi, että arvo poistetaan tarkoituksella.
      const {password: _, ...userWithoutPassword} = found;
      setUser(userWithoutPassword);
      localStorage.setItem('quantix_user', JSON.stringify(userWithoutPassword));

      // JWT token - mock token for demo (real token comes from backend)
      const mockToken = 'demo_jwt_token_' + found.id + '_' + Date.now();
      setToken(mockToken);
      localStorage.setItem('quantix_token', mockToken);

      return true;
    }
    return false;
  };

  const logout = () => {
    // Tyhjennetään sekä React-tila että localStorage, jotta uloskirjautuminen on varma.
    setUser(null);
    setToken(null);
    localStorage.removeItem('quantix_user');
    localStorage.removeItem('quantix_token');
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

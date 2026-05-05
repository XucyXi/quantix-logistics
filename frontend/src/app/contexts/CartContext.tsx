import React, {createContext, useContext, useState, useEffect} from 'react';
import {useAuth} from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
  dietTags?: string[];
}

// Business-asiakkaan alennusprosentti
const BUSINESS_DISCOUNT = 0.15;

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalPriceWithDiscount: number;
  discount: number;
  isBusinessCustomer: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: React.ReactNode}) {
  // Alustusfunktiota käytetään siksi, että localStorage luetaan vain kerran mountissa.
  // Näin vältytään turhilta I/O-lukukerroilta jokaisessa renderissä.
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('quantix_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      // Jos data on korruptoitunut, aloitetaan turvallisesti tyhjästä korista.
      return [];
    }
  });

  // Persistointi tehdään vasta tilan muutoksen jälkeen effectissä.
  // Tämä pitää kirjoituslogiikan yhdessä paikassa, jolloin add/remove/update
  // voivat keskittyä vain tilan laskentaan.
  useEffect(() => {
    localStorage.setItem('quantix_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        // Sama tuote kasvattaa vain määrää, jotta koriin ei synny duplikaattirivejä.
        return prev.map((i) =>
          i.id === item.id ? {...i, quantity: i.quantity + 1} : i
        );
      }
      // Uusi tuote lisätään oletusmäärällä 1.
      return [...prev, {...item, quantity: 1}];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    // Nolla tai negatiivinen määrä tulkitaan poistoksi, jotta tila pysyy validina.
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    // Immutable-päivitys säilyttää Reactin vertailun tehokkaana.
    setItems((prev) => prev.map((i) => (i.id === id ? {...i, quantity} : i)));
  };

  const clearCart = () => setItems([]);

  // Tarkistetaan onko käyttäjä business-asiakas
  const {user} = useAuth();
  const isBusinessCustomer = user?.tier === 'business';

  // Johdetut arvot lasketaan keskitetysti providerissa, jotta UI-komponentit
  // eivät toista samaa laskentaa eri paikoissa.
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = isBusinessCustomer ? totalPrice * BUSINESS_DISCOUNT : 0;
  const totalPriceWithDiscount = totalPrice - discount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        totalPriceWithDiscount,
        discount,
        isBusinessCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  // Hookia saa käyttää vain providerin sisällä.
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

/**
 * @fileoverview Shopping Cart Context.
 * Manages the global state of the shopping cart, including persistence, totals, and business discounts.
 */

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
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('quantix_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('quantix_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? {...i, quantity: i.quantity + 1} : i
        );
      }
      return [...prev, {...item, quantity: 1}];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? {...i, quantity} : i)));
  };

  const clearCart = () => setItems([]);

  const {user} = useAuth();
  const isBusinessCustomer = user?.tier === 'business';

  // Derived state calculations
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

/**
 * Custom hook to consume the CartContext.
 * Must be used within a <CartProvider>.
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

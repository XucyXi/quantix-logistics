import type {User} from '../contexts/AuthContext';

export const BUSINESS_DISCOUNT_RATE = 0.15;

export function isBusinessTierUser(user: User | null): boolean {
  return user?.tier === 'business';
}

export function isDevAdminDiscountUser(user: User | null): boolean {
  return import.meta.env.DEV && user?.role === 'admin';
}

export function getCustomerDiscountRate(user: User | null): number {
  if (isBusinessTierUser(user) || isDevAdminDiscountUser(user)) {
    return BUSINESS_DISCOUNT_RATE;
  }
  return 0;
}

export function getDiscountedPrice(
  price: number,
  discountRate: number
): number {
  return Math.max(0, price * (1 - discountRate));
}

export function formatPrice(price: number): string {
  if (price == null || isNaN(price)) {
    return '0.00 €';
  }
  return `${price.toFixed(2)} €`;
}

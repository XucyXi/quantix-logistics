/**
 * @fileoverview Pricing Utilities.
 * Contains helper functions for calculating discounts and formatting prices.
 */

import type {User} from '../contexts/AuthContext';

export const BUSINESS_DISCOUNT_RATE = 0.15;

/**
 * Checks if the user belongs to the business tier.
 */
export function isBusinessTierUser(user: User | null): boolean {
  return user?.tier === 'business';
}

/**
 * Checks if the user qualifies for the developer admin discount.
 */
export function isDevAdminDiscountUser(user: User | null): boolean {
  return import.meta.env.DEV && user?.role === 'admin';
}

/**
 * Determines the applicable discount rate for a given user.
 */
export function getCustomerDiscountRate(user: User | null): number {
  if (isBusinessTierUser(user) || isDevAdminDiscountUser(user)) {
    return BUSINESS_DISCOUNT_RATE;
  }
  return 0;
}

/**
 * Calculates the final price after applying the discount rate.
 */
export function getDiscountedPrice(
  price: number,
  discountRate: number
): number {
  return Math.max(0, price * (1 - discountRate));
}

/**
 * Formats a raw number into a localized currency string (Euros).
 */
export function formatPrice(price: number): string {
  if (price == null || isNaN(price)) {
    return '0.00 €';
  }
  return `${price.toFixed(2)} €`;
}

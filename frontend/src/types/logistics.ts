export interface User {
  user_id: number;
  role: 'driver' | 'customer' | 'admin';
  email: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  driver_id: number;
  status: string;
  delivery_address: string;
  notes: string;
}

export interface DeliveryTracking {
  tracking_id: number;
  order_id: number;
  status: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export const WAREHOUSE_COORDS: [number, number] = [60.205, 24.887];

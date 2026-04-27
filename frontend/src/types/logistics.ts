export interface User {
  user_id: number;
  role: 'driver' | 'customer' | 'admin';
  email: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  driver_id: number | null;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'in_transit'
    | 'done'
    | 'stuck';
  delivery_address: string;
  notes?: string;
  customer?: {
    company_name: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any[];
  ordered_at: string;
  scheduled_delivery: string | null;
  total_price: number;
  latitude: number;
  longitude: number;
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

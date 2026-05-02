export interface User {
  user_id: number;
  role: 'driver' | 'customer' | 'admin';
  email: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  driver_id: number | null;
  status: 'done' | 'assigned' | 'in_transit' | 'ready_for_pickup';
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
  dest_lat?: string | number;
  dest_lng?: string | number;
}

export interface TrackingResponse {
  status: string;
  latitude: string;
  longitude: string;
  destination: {
    lat: number;
    lng: number;
  };
  driver: {
    latitude: number | string;
    longitude: number | string;
    updated_at?: string;
  } | null;
  boxes?: number;
  contact?: string;
  phone?: string;
  dest_lng?: string | number;
}

export interface TrackingResponse {
  status: string;
  destination: {
    lat: number;
    lng: number;
  };
  driver: {
    lat: number;
    lng: number;
    updated_at?: string;
  } | null;
}

export interface DeliveryTracking {
  tracking_id: number;
  order_id: number;
  status: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  boxes?: number;
}

export const WAREHOUSE_COORDS: [number, number] = [60.205, 24.887];

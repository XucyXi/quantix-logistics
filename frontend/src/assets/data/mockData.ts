import {Order, DeliveryTracking} from '../../types/logistics';

export const mockOrders: Order[] = [
  {
    order_id: 101,
    customer_id: 501,
    driver_id: 12,
    status: 'in_transit',
    delivery_address: 'Mannerheimintie 12, 00100 Helsinki',
    notes: 'Ovikoodi 1234, jätä paketti ovelle.',
    ordered_at: new Date().toISOString(),
    scheduled_delivery: null,
    total_price: 120,
    latitude: 60.1699,
    longitude: 24.9384,
  },
  {
    order_id: 102,
    customer_id: 502,
    driver_id: 12,
    status: 'ready_for_pickup',
    delivery_address: 'Hämeentie 5, 00530 Helsinki',
    notes: 'Soita ennen saapumista, summeri ei toimi.',
    ordered_at: new Date().toISOString(),
    scheduled_delivery: null,
    total_price: 90,
    latitude: 60.183,
    longitude: 24.953,
  },
  {
    order_id: 103,
    customer_id: 503,
    driver_id: 12,
    status: 'assigned',
    delivery_address: 'Länsiväylä 1, 02100 Espoo',
    notes: 'Nouto takapihan lastauslaiturilta.',
    ordered_at: new Date().toISOString(),
    scheduled_delivery: null,
    total_price: 150,
    latitude: 60.199,
    longitude: 24.933,
  },
];

export const mockTracking: DeliveryTracking[] = [
  {
    tracking_id: 9001,
    order_id: 101,
    status: 'moving',
    latitude: 60.1699, // Kamppi
    longitude: 24.9384,
    updated_at: new Date().toISOString(),
  },
  {
    tracking_id: 9002,
    order_id: 102,
    status: 'pending',
    latitude: 60.183, // Kallio
    longitude: 24.953,
    updated_at: new Date().toISOString(),
  },
  {
    tracking_id: 9003,
    order_id: 103,
    status: 'pending',
    latitude: 60.199, // Pasila
    longitude: 24.933,
    updated_at: new Date().toISOString(),
  },
];

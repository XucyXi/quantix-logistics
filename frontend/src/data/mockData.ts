import {Order, DeliveryTracking} from '../types/logistics';

export const mockOrders: Order[] = [
  {
    order_id: 101,
    customer_id: 501,
    driver_id: 12,
    status: 'in-transit',
    delivery_address: 'Mannerheimintie 12, 00100 Helsinki',
    notes: 'Ovikoodi 1234, jätä paketti ovelle.',
  },
  {
    order_id: 102,
    customer_id: 502,
    driver_id: 12,
    status: 'pending',
    delivery_address: 'Hämeentie 5, 00530 Helsinki',
    notes: 'Soita ennen saapumista, summeri ei toimi.',
  },
  {
    order_id: 103,
    customer_id: 503,
    driver_id: 12,
    status: 'pending',
    delivery_address: 'Länsiväylä 1, 02100 Espoo',
    notes: 'Nouto takapihan lastauslaiturilta.',
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
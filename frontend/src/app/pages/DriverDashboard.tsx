import {DeliveryTracking} from '../../types/logistics';
import {DeliveryManager} from '../components/delivery-tracking/DeliveryManager';

const MOCK_TRACKINGS: DeliveryTracking[] = [
  {
    tracking_id: 1001,
    order_id: 1,
    status: 'in_transit',
    latitude: 60.1699,
    longitude: 23.9384,
    updated_at: new Date().toISOString(),
  },
  {
    tracking_id: 1002,
    order_id: 2,
    status: 'pending',
    latitude: 60.18,
    longitude: 24.95,
    updated_at: new Date().toISOString(),
  },
  {
    tracking_id: 1003,
    order_id: 3,
    status: 'delivered',
    latitude: 60.2005,
    longitude: 24.905,
    updated_at: new Date().toISOString(),
  },
  {
    tracking_id: 1005,
    order_id: 4,
    status: 'delivered',
    latitude: 60.2005,
    longitude: 24.905,
    updated_at: new Date().toISOString(),
  },
];

export function DriverDashboard() {
  return (
    <section style={{height: '100vh', width: '100%'}}>
      <DeliveryManager deliveries={MOCK_TRACKINGS} />
    </section>
  );
}

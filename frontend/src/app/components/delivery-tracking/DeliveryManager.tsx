import {useEffect, useRef, useState} from 'react';
import {Map} from './Map';
import {OrderList} from './OrderList';
import {DeliveryTracking, Order} from '../../../types/logistics';
import {updateDeliveryLocation} from '../../utils/updateDeliveryLocation';

interface DeliveryManagerProps {
  deliveries: DeliveryTracking[];
  orders: Order[];
}
export const DeliveryManager = ({deliveries, orders}: DeliveryManagerProps) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    orders[0]?.order_id || null
  );

  const currentOrder = orders.find((o) => o.order_id === selectedOrderId);
  const currentTracking = deliveries.find(
    (d) => d.order_id === selectedOrderId
  );
  const lastUpdateTimestamp = useRef<number>(0);
  const UPDATE_INTERVAL = 10000;

  useEffect(() => {
    if (!selectedOrderId || !('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const {latitude, longitude} = pos.coords;
        const now = Date.now();

        if (now - lastUpdateTimestamp.current > UPDATE_INTERVAL) {
          updateDeliveryLocation(selectedOrderId, latitude, longitude);
          lastUpdateTimestamp.current = now;
          console.log('Sijainti lähetetty palvelimelle');
        }
        console.log(
          `Päivitetään tilaus ${selectedOrderId}: ${latitude}, ${longitude}`
        );
      },
      (err) => console.error('GPS virhe:', err),
      {enableHighAccuracy: true, maximumAge: 5000}
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [selectedOrderId]);

  if (!currentOrder || !currentTracking) {
    return (
      <div style={{padding: '1rem'}}>Ei aktiivista toimitusta valittuna</div>
    );
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div style={{flex: 1, minHeight: '300px'}}>
        <Map
          startCoords={[60.1699, 24.9384]}
          endCoords={[currentTracking.latitude, currentTracking.longitude]}
        />
      </div>

      <div style={{maxHeight: '40vh', overflowY: 'auto'}}>
        <OrderList
          orders={orders}
          selectedId={selectedOrderId}
          onSelect={(order) => setSelectedOrderId(order.order_id)}
        />
      </div>
    </div>
  );
};

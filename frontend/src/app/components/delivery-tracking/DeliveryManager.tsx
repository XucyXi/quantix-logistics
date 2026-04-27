/*import {useState} from 'react';
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
*/
import {useEffect, useRef, useState} from 'react';
import {Map} from './Map';
import {OrderList} from './OrderList';
import {DeliveryTracking, Order} from '../../../types/logistics';
import {updateDeliveryLocation} from '../../utils/updateDeliveryLocation';
import {time} from 'motion';
import {useOutletContext} from 'react-router';
let lastCoords = {lat: 0, lng: 0};
const MIN_DISTANCE = 0.0001;
const WAREHOUSE_COORDS: [number, number] = [60.1719, 24.9395];

export const DeliveryManager = () => {
  const {orders, deliveries} = useOutletContext<{
    orders: Order[];
    deliveries: DeliveryTracking[];
  }>();
  const ordersList = Array.isArray(orders) ? orders : [];
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    ordersList[0]?.order_id || null
  );
  const currentOrder = orders.find((o) => o.order_id === selectedOrderId);
  const destination: [number, number] =
    currentOrder?.latitude && currentOrder?.longitude
      ? [currentOrder.latitude, currentOrder.longitude]
      : WAREHOUSE_COORDS;

  const lastUpdateTimestamp = useRef<number>(0);
  const UPDATE_INTERVAL = 20000;
  const MOVE_THRESHOLD = 0.0001;

  useEffect(() => {
    if (!selectedOrderId || !('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const {latitude, longitude} = pos.coords;
        const now = Date.now();
        const timePassed = now - lastUpdateTimestamp.current > UPDATE_INTERVAL;
        const movedEnough =
          Math.abs(lastCoords.lat - latitude) > MOVE_THRESHOLD ||
          Math.abs(lastCoords.lng - longitude) > MOVE_THRESHOLD;
        if (timePassed && movedEnough) {
          updateDeliveryLocation(selectedOrderId, latitude, longitude);
          lastUpdateTimestamp.current = now;
          lastCoords = {lat: latitude, lng: longitude};
        }
      },
      (err) => console.error('GPS virhe:', err),
      {enableHighAccuracy: true, maximumAge: 5000}
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [selectedOrderId]);

  if (!orders || orders.length === 0) {
    return <div style={{padding: '2rem'}}>Ladataan karttaa...</div>;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div style={{flex: 1, minHeight: '300px'}}>
        <Map
          key={selectedOrderId}
          startCoords={WAREHOUSE_COORDS}
          endCoords={destination}
        />
        {!currentOrder && ordersList.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'white',
              padding: '5px',
              borderRadius: '4px',
              zIndex: 1000,
            }}
          >
            Valitse toimitus listalta...
          </div>
        )}
      </div>

      <div
        style={{
          maxHeight: '40vh',
          overflowY: 'auto',
          borderTop: '1px solid #ccc',
        }}
      >
        {ordersList.length > 0 ? (
          <OrderList
            orders={ordersList}
            selectedId={selectedOrderId}
            onSelect={(order) => setSelectedOrderId(order.order_id)}
          />
        ) : (
          <div style={{padding: '2rem', textAlign: 'center'}}>
            <strong>Ei aktiivisia toimituksia.</strong>
          </div>
        )}
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useState} from 'react';
import {Map} from './Map';
import {OrderList} from './OrderList';
import {Order, TrackingResponse} from '../../../types/logistics';

export const CustomerTrackingView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(
    null
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
        });
        if (res.ok) {
          const {orders} = await res.json();
          setOrders(orders);
          console.log('data', orders);
          if (orders.length > 0 && !selectedOrder) {
            setSelectedOrder(orders[0]);
          }
        }
      } catch (err) {
        console.error('Virhe haettaessa tilauksia:', err);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder?.order_id) return;
    const fetchTrackingData = async () => {
      try {
        const res = await fetch(
          `/api/deliveries/${selectedOrder?.order_id}/status`,
          {
            headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
          }
        );
        if (res.ok) {
          const data = await res.json();
          console.log('tracking data', data?.latitude, data?.longitude);
          setTrackingData(data);
        }
      } catch (err) {
        console.error('Tracking fetch failed', err);
      }
    };

    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 100000); // Päivitys 100s välein

    return () => clearInterval(interval);
  }, [selectedOrder]);

  const renderMap = () => {
    if (!selectedOrder)
      return (
        <p style={{textAlign: 'center', marginTop: '100px'}}>
          Valitse tilaus seurantaa varten
        </p>
      );

    const driverLat = Number(trackingData?.latitude);
    const driverLng = Number(trackingData?.longitude);

    const destLat = Number(selectedOrder?.latitude);
    const destLng = Number(selectedOrder?.longitude);

    console.log('start coords', driverLat, driverLng);
    const hasDriverLocation =
      !isNaN(driverLat) && !isNaN(driverLng) && driverLat !== 0;
    const hasDestination = !isNaN(destLat) && !isNaN(destLng) && destLat !== 0;

    if (!hasDestination) {
      return (
        <p style={{textAlign: 'center', marginTop: '100px'}}>
          Toimitusosoitteen koordinaatit puuttuvat.
        </p>
      );
    }
    if (!hasDriverLocation) {
      return (
        <div style={{height: '100%', width: '100%'}}>
          <p
            style={{
              position: 'absolute',
              zIndex: 1000,
              background: 'white',
              padding: '5px',
            }}
          >
            Odotetaan kuljettajan sijaintia...
          </p>
          <Map
            startCoords={[driverLat || 0, driverLng || 0]}
            endCoords={[destLat || 0, destLng || 0]}
          />
        </div>
      );
    }

    return (
      <Map
        startCoords={[driverLat, driverLng]}
        endCoords={[destLat, destLng]}
      />
    );
  };

  /*useEffect(() => {
    if (!selectedOrder?.dest_lat || !selectedOrder?.dest_lng) {
      console.log('Tilauksella ei koordinaatteja, skipataan seuranta');
      return;
    }

    if (selectedOrder?.status === 'done') {
      fetchTracking();
      return;
    }

    async function fetchTracking() {
      try {
        const res = await fetch(
          `/api/deliveries/${selectedOrder?.order_id}/status`,
          {
            headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
          }
        );
        if (res.ok) {
          const trackingData = await res.json();
          setTrackingData(trackingData);
        }
      } catch (err) {
        console.error('Tracking fetch failed', err);
      }
    }

    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [selectedOrder]);*/

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        gap: '10px',
        //overflow: 'hidden',
      }}
    >
      <div style={{flex: '1', position: 'relative', width: '100%'}}>
        {renderMap()}
      </div>

      <div
        style={{
          padding: '20px',
          background: 'white',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        {selectedOrder && (
          <div style={{marginBottom: '15px'}}>
            <h2 style={{margin: 0}}>Tilaus #{selectedOrder.order_id}</h2>
            <p style={{margin: '5px 0', color: '#666'}}>
              Tila: {selectedOrder.status}
            </p>
            {trackingData?.driver === null && (
              <span style={{color: 'orange', fontSize: '14px'}}>
                Kuljettaja valmistelee toimitusta
              </span>
            )}
          </div>
        )}

        <div style={{maxHeight: '300px', overflowY: 'auto'}}>
          <h3>Omat toimitukset</h3>
          <OrderList
            orders={orders}
            selectedId={selectedOrder?.order_id}
            onSelect={(order) => setSelectedOrder(order)}
            variant="customer"
          />
        </div>
      </div>
    </div>
  );
};

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
    // Polling: Haetaan kuskin sijainti bäkistä 10 sekunnin välein
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
        });

        const data = await res.json();
        console.log('data', data);
        setOrders(Array.isArray(data) ? data : []);

        if (data && data.length > 0 && !selectedOrder) {
          setSelectedOrder(data[0]);
        }
      } catch (err) {
        console.error('orders fetch failed', err);
      }
    };

    fetchOrders();
  }, []);

  const renderMap = () => {
    if (!trackingData) return <p>Ladataan seurantaa...</p>;
    if (!selectedOrder)
      return (
        <p style={{textAlign: 'center', marginTop: '100px'}}>
          Valitse tilaus seurantaa varten
        </p>
      );

    const destLat = Number(
      trackingData.destination?.lat || (selectedOrder as any).dest_lat
    );
    const destLng = Number(
      trackingData.destination?.lng || (selectedOrder as any).dest_lng
    );

    if (!destLat || !destLng) {
      return (
        <p style={{textAlign: 'center', marginTop: '100px'}}>
          Toimitusosoitteen koordinaatit puuttuvat.
        </p>
      );
    }

    return (
      <Map
        startCoords={[
          Number(trackingData.driver?.lat),
          Number(trackingData.driver?.lng),
        ]}
        endCoords={[
          Number((selectedOrder as any).dest_lat) || 0,
          Number((selectedOrder as any).dest_lng) || 0,
        ]}
      />
    );
  };
  console.log('selected', selectedOrder);

  useEffect(() => {
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
          const data = await res.json();
          setTrackingData(data);
        }
      } catch (err) {
        console.error('Tracking fetch failed', err);
      }
    }

    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [selectedOrder]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        gap: '10px',
      }}
    >
      <div
        style={{flex: '1 1 400px', position: 'relative', minHeight: '300px'}}
      >
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

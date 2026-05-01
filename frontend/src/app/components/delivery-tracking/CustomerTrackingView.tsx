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

  const getAuthToken = () =>
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('quantix_token') ||
    '';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: {Authorization: `Bearer ${getAuthToken()}`},
        });
        const data = await res.json();
        const nextOrders = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : [];
        setOrders(nextOrders);

        if (nextOrders.length > 0) {
          setSelectedOrder((prevSelected) => {
            if (!prevSelected) return nextOrders[0];
            return (
              nextOrders.find((o: Order) => o.order_id === prevSelected.order_id) ||
              nextOrders[0]
            );
          });
        }
      } catch (err) {
        console.error('orders fetch failed', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderMap = () => {
    if (!selectedOrder)
      return (
        <p style={{textAlign: 'center', marginTop: '100px'}}>
          Valitse tilaus seurantaa varten
        </p>
      );
    if (!trackingData) return <p>Ladataan seurantaa...</p>;

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

    // 3. Kaikki OK -> Näytetään kartta
    return (
      <Map
        startCoords={[
          Number(trackingData.driver?.lat ?? destLat),
          Number(trackingData.driver?.lng ?? destLng),
        ]}
        endCoords={[
          Number((selectedOrder as any).dest_lat) || 0,
          Number((selectedOrder as any).dest_lng) || 0,
        ]}
      />
    );
  };

  useEffect(() => {
    if (!selectedOrder) {
      setTrackingData(null);
      return;
    }
    const currentOrder = selectedOrder;

    if (!currentOrder.dest_lat || !currentOrder.dest_lng) {
      console.log('Tilauksella ei koordinaatteja, skipataan seuranta');
      setTrackingData(null);
      return;
    }

    async function fetchTracking() {
      try {
        const res = await fetch(
          `/api/deliveries/${currentOrder.order_id}/status`,
          {
            headers: {Authorization: `Bearer ${getAuthToken()}`},
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
    if (currentOrder.status === 'done') {
      return;
    }

    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [
    selectedOrder?.order_id,
    selectedOrder?.status,
    selectedOrder?.dest_lat,
    selectedOrder?.dest_lng,
  ]);

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

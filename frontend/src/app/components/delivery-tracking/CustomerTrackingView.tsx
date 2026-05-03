/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useState} from 'react';
import {Map} from './Map';
import {OrderList} from './OrderList';
import {
  Order,
  TrackingResponse,
  WAREHOUSE_COORDS,
} from '../../../types/logistics';

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
          if (orders.length > 0 && !selectedOrder) {
            const activeOrder =
              orders?.find((o: Order) => o.status !== 'done') || orders[0];

            setSelectedOrder(activeOrder);
          }
        }
      } catch (err) {
        console.error('Virhe haettaessa tilauksia:', err);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder?.order_id || selectedOrder.status !== 'in_transit')
      return;

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
          setTrackingData(data);
        }
      } catch (err) {
        console.error('Tracking fetch failed', err);
      }
    };

    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 20000);

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

    const isInTransit = selectedOrder.status === 'in_transit';
    const hasDriverLocation =
      isInTransit && !isNaN(driverLat) && !isNaN(driverLng) && driverLat !== 0;
    const hasDestination = !isNaN(destLat) && !isNaN(destLng) && destLat !== 0;

    const startPoint: [number, number] = hasDriverLocation
      ? [driverLat, driverLng]
      : WAREHOUSE_COORDS;

    return (
      <div style={{height: '100%', width: '100%', position: 'relative'}}>
        {!isInTransit && (
          <div style={overlayStyle}>
            {selectedOrder.status === 'ready_for_pickup'
              ? 'Tilaus on pakattu ja odottaa kuljetusta'
              : 'Tilauksesi on käsittelyssä'}
          </div>
        )}

        {isInTransit && !hasDriverLocation && (
          <div style={overlayStyle}>
            {' '}
            Haetaan kuljettajan tarkkaa sijaintia...
          </div>
        )}

        <Map
          startCoords={startPoint}
          endCoords={[destLat, destLng]}
          showRoute={false}
        />
      </div>
    );
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    background: 'rgba(255,255,255,0.95)',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontSize: '14px',
    fontWeight: 'bold',
  };

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

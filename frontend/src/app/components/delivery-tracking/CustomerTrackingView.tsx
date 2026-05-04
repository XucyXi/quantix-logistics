import {useEffect, useState} from 'react';
import {Map} from './Map';
import {OrderList} from './OrderList';
import {Order, WAREHOUSE_COORDS} from '../../../types/logistics';
import {orderService, TrackingData} from '../../services/orderService';
import {useAuth} from '../../contexts/AuthContext';

export const CustomerTrackingView = () => {
  const {token} = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  // TILAUKSIEN HAKU
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await orderService.getCustomerOrders({}, token);

        const fetchedOrders = Array.isArray(res) ? res : res.orders || [];
        setOrders(fetchedOrders);

        setSelectedOrder((prevSelected) => {
          if (fetchedOrders.length > 0 && !prevSelected) {
            return (
              fetchedOrders.find((o: Order) => o.status !== 'done') ||
              fetchedOrders[0]
            );
          }
          return prevSelected;
        });
      } catch (err) {
        console.error('Virhe haettaessa tilauksia:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // SEURANTADATAN HAKU
  useEffect(() => {
    if (
      !selectedOrder?.order_id ||
      selectedOrder.status !== 'in_transit' ||
      !token
    ) {
      setTimeout(() => setTrackingData(null), 0);
      return;
    }

    const fetchTracking = async () => {
      try {
        const data = await orderService.getTrackingData(
          selectedOrder.order_id,
          token
        );
        setTrackingData(data);
      } catch (err) {
        console.error('Tracking fetch failed', err);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [selectedOrder?.order_id, selectedOrder?.status, token]);

  const renderMap = () => {
    if (!selectedOrder) {
      return (
        <p
          style={{
            textAlign: 'center',
            marginTop: '100px',
            fontWeight: 'bold',
            color: '#64748b',
          }}
        >
          Valitse tilaus seurantaa varten
        </p>
      );
    }

    const driverLat = Number(trackingData?.driver?.latitude);
    const driverLng = Number(trackingData?.driver?.longitude);

    type OrderWithCoords = Order & {latitude?: number; longitude?: number};
    const destLat = Number(
      trackingData?.destination?.lat ||
        (selectedOrder as OrderWithCoords).latitude ||
        0
    );
    const destLng = Number(
      trackingData?.destination?.lng ||
        (selectedOrder as OrderWithCoords).longitude ||
        0
    );

    const isInTransit = selectedOrder.status === 'in_transit';
    const hasDriverLocation =
      isInTransit && !isNaN(driverLat) && !isNaN(driverLng) && driverLat !== 0;

    const startPoint: [number, number] = hasDriverLocation
      ? [driverLat, driverLng]
      : WAREHOUSE_COORDS;

    return (
      <div style={{height: '100%', width: '100%', position: 'relative'}}>
        {!isInTransit && (
          <div style={overlayStyle}>
            {selectedOrder.status === 'ready_for_pickup'
              ? 'Tilaus on pakattu ja odottaa kuljetusta'
              : selectedOrder.status === 'done'
                ? 'Tilaus on toimitettu'
                : 'Tilauksesi on käsittelyssä'}
          </div>
        )}

        {isInTransit && !hasDriverLocation && (
          <div style={overlayStyle}>
            Haetaan kuljettajan tarkkaa sijaintia...
          </div>
        )}

        <Map
          startCoords={startPoint}
          endCoords={[destLat, destLng]}
          showRoute={false}
          variant="customer"
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
    padding: '10px 15px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0f2444',
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
      <div
        style={{
          flex: '1',
          position: 'relative',
          width: '100%',
          minHeight: '300px',
        }}
      >
        {renderMap()}
      </div>

      <div
        style={{
          padding: '20px',
          background: 'white',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          zIndex: 10,
        }}
      >
        {selectedOrder && (
          <div style={{marginBottom: '20px'}}>
            <h2
              style={{margin: '0 0 5px 0', fontSize: '20px', color: '#0f2444'}}
            >
              Tilaus #{selectedOrder.order_id}
            </h2>
            <p
              style={{
                margin: '0 0 8px 0',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Tila:{' '}
              <span style={{color: '#f59e0b', fontWeight: 'bold'}}>
                {selectedOrder.status}
              </span>
            </p>
            {/* KORJATTU VIRHE 4: Tyyppimuunnos stringiksi estää TS-varoituksen */}
            {(selectedOrder.status as string) === 'pending' && (
              <span
                style={{color: '#f97316', fontSize: '14px', fontWeight: 'bold'}}
              >
                Kuljettaja valmistelee toimitusta
              </span>
            )}
          </div>
        )}

        <div
          style={{maxHeight: '350px', overflowY: 'auto', paddingRight: '5px'}}
        >
          <h3
            style={{fontSize: '16px', color: '#0f2444', marginBottom: '12px'}}
          >
            Omat toimitukset
          </h3>
          <OrderList
            orders={orders}
            selectedId={selectedOrder?.order_id}
            onSelect={(order: Order) => {
              setSelectedOrder(order);
              setTrackingData(null); // Lisätty turvatoimi: nollaa heti kun vaihdat tilausta
            }}
            variant="customer"
          />
        </div>
      </div>
    </div>
  );
};

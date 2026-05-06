import {useEffect, useMemo, useRef, useState} from 'react';
import {Map} from './Map';
import {OrderList} from './OrderList';
import {DeliveryTracking, Order} from '../../../types/logistics';
import {updateDeliveryLocation} from '../../utils/updateDeliveryLocation';
import {useOutletContext} from 'react-router';
import {WAREHOUSE_COORDS} from '../../../types/logistics';

export const DeliveryManager = () => {
  const lastCoords = useRef({lat: 0, lng: 0});
  const [driverCoords, setDriverCoords] =
    useState<[number, number]>(WAREHOUSE_COORDS);
  const {orders} = useOutletContext<{
    orders: Order[];
    deliveries: DeliveryTracking[];
  }>();
  const isSimulating = useRef(false);
  const [isSimulatingState, setIsSimulatingState] = useState(false);
  const ordersList = Array.isArray(orders) ? orders : [];
  const filteredOrdersList = useMemo(() => {
    return Array.isArray(orders)
      ? orders.filter((o) => o.status !== 'done')
      : [];
  }, [orders]);

  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(
    undefined
  );
  const currentOrder = ordersList.find((o) => o.order_id === selectedOrderId);
  const destination: [number, number] = useMemo(() => {
    if (!currentOrder || currentOrder.status === 'ready_for_pickup') {
      return WAREHOUSE_COORDS;
    }
    if (currentOrder.status === 'in_transit') {
      const lat = Number(currentOrder.latitude);
      const lng = Number(currentOrder.longitude);

      return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : WAREHOUSE_COORDS;
    }

    return WAREHOUSE_COORDS;
  }, [currentOrder]);

  const lastUpdateTimestamp = useRef<number>(0);
  const UPDATE_INTERVAL = 15000;
  const MOVE_THRESHOLD = 0.0001;

  const runSimulation = async () => {
    if (!currentOrder || currentOrder?.status !== 'in_transit') {
      alert('Valitse ensin tilaus, joka on in_transit');
      return;
    }

    if (isSimulating.current) {
      isSimulating.current = false;
      setIsSimulatingState(false);
      return;
    }
    isSimulating.current = true;
    setIsSimulatingState(true);

    const start = driverCoords;
    const end = destination;

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await res.json();

      if (!data?.routes?.length) return;
      const points = data.routes[0].geometry.coordinates;

      for (let i = 0; i < points.length; i += 2) {
        if (!isSimulating.current) break;
        const [lng, lat] = points[i];
        setDriverCoords([lat, lng]);

        await updateDeliveryLocation(currentOrder.order_id, lat, lng).catch(
          console.error
        );
        console.log(`Simuloitu sijainti: ${lat}, ${lng}`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    } catch (error) {
      console.error('Simulaatiovirhe:', error);
    } finally {
      isSimulating.current = false;
    }
  };
  useEffect(() => {
    console.log('Sijainti päivittyi:', driverCoords, 'Kohde:', destination);
  }, [driverCoords, destination]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const {latitude, longitude} = pos.coords;
        const now = Date.now();

        if (
          selectedOrderId &&
          currentOrder?.status === 'in_transit' &&
          !isSimulating.current
        ) {
          const timePassed =
            now - lastUpdateTimestamp.current > UPDATE_INTERVAL;
          const dist = Math.sqrt(
            Math.pow(latitude - lastCoords.current.lat, 2) +
              Math.pow(longitude - lastCoords.current.lng, 2)
          );
          if (timePassed && dist > MOVE_THRESHOLD) {
            updateDeliveryLocation(selectedOrderId, latitude, longitude);
            lastUpdateTimestamp.current = now;
            lastCoords.current = {lat: latitude, lng: longitude};
            setDriverCoords([latitude, longitude]);
          }
        }
      },
      (err) => console.error('GPS virhe:', err),
      {enableHighAccuracy: true, maximumAge: 5000}
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [selectedOrderId, currentOrder?.status, isSimulatingState]);

  if (!orders || orders.length === 0) {
    return <div style={{padding: '2rem'}}>Ladataan karttaa...</div>;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '90vh'}}>
      <div
        style={{
          flex: '1 1 auto',
          position: 'relative',
          width: '100%',
          minHeight: '300px',
          overflow: 'hidden',
        }}
      >
        {import.meta.env.DEV && (
          <button
            onClick={runSimulation}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1001,
              padding: '10px',
              background: '#ff4757',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isSimulatingState ? 'Pysäytä' : 'Simuloi ajo'}{' '}
          </button>
        )}
        <Map
          startCoords={driverCoords}
          endCoords={destination}
          showRoute={
            (!!currentOrder && currentOrder.status === 'in_transit') ||
            currentOrder?.status === 'ready_for_pickup'
          }
          showMarkers={!!currentOrder}
          orderSelected={!!currentOrder}
          variant="driver"
        />
        {!currentOrder && filteredOrdersList.length > 0 && (
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
        {filteredOrdersList.length > 0 ? (
          <OrderList
            orders={filteredOrdersList}
            selectedId={selectedOrderId}
            onSelect={(order) => setSelectedOrderId(order.order_id)}
            variant="driver"
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

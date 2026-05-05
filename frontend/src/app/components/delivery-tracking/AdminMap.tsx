/**
 * @fileoverview Admin Map Component.
 * Renders an interactive map displaying all active drivers, their destinations, and calculated routes.
 */

import {useEffect, useRef, useState} from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import driverMarker from '../../../assets/icons/driver.webp';
import {fetchRoute} from '../../utils/osrmApi';
import {RouteWatcher} from './RouteWatcher';
import {useTheme} from '../../contexts/ThemeProvider';

const driverIcon = L.divIcon({
  html: `
    <div style="
      background-color: white;
      border: 3px solid #ff0000;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    ">
      <img src="${driverMarker}" style="width: 25px; height: 25px; object-fit: contain;" />
    </div>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export interface ActiveDelivery {
  order_id: number;
  driver_lat: number;
  driver_lng: number;
  dest_lat?: number;
  dest_lng?: number;
  delivery_address: string;
  updated_at?: string;
  status?: string;
  driver_id?: number | null;
}

/**
 * Intelligent utility component that handles dynamic map zooming and panning.
 *
 * Behaviors:
 * 1. Fits bounds between driver and destination when a new order is selected.
 * 2. Smoothly pans to follow the driver if the same order remains selected (polling updates).
 * 3. Fits bounds to show all active drivers if no specific order is selected.
 */
function MapFitter({
  deliveries,
  selectedId,
  route,
}: {
  deliveries: ActiveDelivery[];
  selectedId: number | null;
  route?: [number, number][];
}) {
  const map = useMap();
  const prevSelectedId = useRef<number | null | undefined>(undefined);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (deliveries.length === 0) return;

    const selected = selectedId
      ? deliveries.find((d) => d.order_id === selectedId)
      : null;

    // Delegate zooming to RouteWatcher if a valid route is being rendered
    if (route && route.length > 0) return;

    if (prevSelectedId.current !== selectedId) {
      // Scenario 1: Selection changed, or user clicked "Show All"
      prevSelectedId.current = selectedId;

      const targetLat = Number(selected?.dest_lat);
      const targetLng = Number(selected?.dest_lng);
      const hasTarget =
        !isNaN(targetLat) && !isNaN(targetLng) && targetLat !== 0;

      if (selected && hasTarget) {
        const bounds = L.latLngBounds([
          [Number(selected.driver_lat), Number(selected.driver_lng)],
          [targetLat, targetLng],
        ]);
        map.fitBounds(bounds, {padding: [50, 50]});
      } else if (selected && selected.driver_lat && selected.driver_lng) {
        map.setView(
          [Number(selected.driver_lat), Number(selected.driver_lng)],
          14
        );
      } else if (!selectedId) {
        const validCoords = deliveries
          .filter((d) => d.driver_lat && d.driver_lng)
          .map(
            (d) =>
              [Number(d.driver_lat), Number(d.driver_lng)] as [number, number]
          );

        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, {padding: [50, 50], maxZoom: 14});
        }
      }
    } else if (selectedId && selected && selected.driver_lat) {
      // Scenario 2: Data polling update; pan smoothly to new driver location
      map.panTo([Number(selected.driver_lat), Number(selected.driver_lng)], {
        animate: true,
      });
    } else if (isInitialRender.current && !selectedId) {
      // Scenario 3: Initial render; fit all drivers into view
      const validCoords = deliveries
        .filter((d) => d.driver_lat && d.driver_lng)
        .map(
          (d) =>
            [Number(d.driver_lat), Number(d.driver_lng)] as [number, number]
        );

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, {padding: [50, 50], maxZoom: 14});
        isInitialRender.current = false;
      }
    }
  }, [deliveries, selectedId, map, route]);

  return null;
}

export function AdminMap({
  deliveries,
  selectedId,
}: {
  deliveries: ActiveDelivery[];
  selectedId: number | null;
}) {
  const {theme} = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const computeDarkMode = () => {
      setIsDarkMode(
        theme === 'dark' || (theme === 'system' && mediaQuery.matches)
      );
    };

    computeDarkMode();

    if (theme === 'system') {
      const listener = () => computeDarkMode();
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener);
      } else {
        mediaQuery.addListener(listener);
      }
      return () => {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', listener);
        } else {
          mediaQuery.removeListener(listener);
        }
      };
    }
  }, [theme]);

  // Fetch route geometry when the selected order changes
  useEffect(() => {
    let active = true;

    const getRoute = async () => {
      const selected = selectedId
        ? deliveries.find((d) => d.order_id === selectedId)
        : null;

      if (!selected || !selected.driver_lat || !selected.driver_lng) {
        setRoute([]);
        return;
      }

      const targetLat = Number(selected.dest_lat);
      const targetLng = Number(selected.dest_lng);
      const hasTarget =
        !isNaN(targetLat) && !isNaN(targetLng) && targetLat !== 0;

      if (!hasTarget) {
        setRoute([]);
        return;
      }

      try {
        const startCoords: [number, number] = [
          selected.driver_lat,
          selected.driver_lng,
        ];
        const endCoords: [number, number] = [targetLat, targetLng];
        const coords = await fetchRoute(startCoords, endCoords);
        if (active) setRoute(coords);
      } catch (error) {
        console.error('Reitin haku epäonnistui:', error);
        if (active) setRoute([]);
      }
    };

    getRoute();

    return () => {
      active = false;
    };
  }, [deliveries, selectedId]);

  const defaultCenter: [number, number] = [60.205, 24.887];

  const tileUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      style={{height: '100%', width: '100%', zIndex: 0}}
    >
      <TileLayer
        key={isDarkMode ? 'dark' : 'light'}
        url={tileUrl}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <MapFitter
        deliveries={deliveries}
        selectedId={selectedId}
        route={route}
      />
      {route.length > 0 && <RouteWatcher coords={route} />}

      {deliveries.map((del) => {
        if (!del.driver_lat || !del.driver_lng) return null;

        const isSelected = selectedId === del.order_id;
        const opacity = selectedId === null || isSelected ? 1 : 0.4;

        const targetLat = Number(del.dest_lat);
        const targetLng = Number(del.dest_lng);
        const hasTarget =
          !isNaN(targetLat) && !isNaN(targetLng) && targetLat !== 0;

        const dLat = Number(del.driver_lat);
        const dLng = Number(del.driver_lng);

        return (
          <div key={`container-${del.order_id}`}>
            <Marker
              key={`driver-${del.order_id}-${dLat}-${dLng}`}
              position={[dLat, dLng]}
              icon={driverIcon}
              opacity={opacity}
            >
              <Popup>
                <b>Tilaus #{del.order_id}</b>
                <br />
                Osoite: {del.delivery_address}
              </Popup>
            </Marker>

            {isSelected && hasTarget && (
              <>
                <Marker
                  key={`dest-${del.order_id}-${targetLat}-${targetLng}`}
                  position={[targetLat, targetLng]}
                >
                  <Popup>Määränpää: {del.delivery_address}</Popup>
                </Marker>

                {route.length > 0 ? (
                  <Polyline
                    positions={route}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 5,
                      dashArray: '5, 10',
                      lineJoin: 'round',
                    }}
                  />
                ) : (
                  <Polyline
                    positions={[
                      [dLat, dLng],
                      [targetLat, targetLng],
                    ]}
                    color="#3b82f6"
                    weight={4}
                    dashArray="10, 10"
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </MapContainer>
  );
}

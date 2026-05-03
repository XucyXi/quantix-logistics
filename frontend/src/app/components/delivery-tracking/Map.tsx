/*import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useEffect, useState} from 'react';
import {fetchRoute} from '../../utils/osrmApi.ts';
import {RouteWatcher} from './RouteWatcher.tsx';

interface MapProps {
  startCoords: [number, number]; // lat, lng
  endCoords: [number, number]; // lat, lng
}

export const Map = ({startCoords, endCoords}: MapProps) => {
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!startCoords || !endCoords) return;
    const getRoute = async () => {
      try {
        const coords = await fetchRoute(startCoords, endCoords);
        setRoute(coords);
      } catch (error) {
        console.error('error in Map components getRoute', error);
      }
    };
    getRoute();
  }, [startCoords, endCoords]);

  return (
    <MapContainer
      center={startCoords}
      zoom={8}
      style={{height: '60vh', width: '100%', touchAction: 'none'}}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={startCoords}>
        <Popup>Lähtöpiste</Popup>
      </Marker>

      <Marker position={endCoords}>
        <Popup>Kohde</Popup>
      </Marker>

      <Polyline
        positions={route}
        color="red"
        dashArray="5, 10"
        weight={5}
        opacity={0.7}
      />
      <RouteWatcher coords={route} />
    </MapContainer>
  );
};
*/

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useEffect, useState} from 'react';
import {fetchRoute} from '../../utils/osrmApi.ts';
import {RouteWatcher} from './RouteWatcher.tsx';
import L from 'leaflet';
import driverMarker from '../../../assets/icons/driver.webp';
import {WAREHOUSE_COORDS} from '../../../types/logistics.ts';

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

interface MapProps {
  startCoords: [number, number];
  endCoords: [number, number];
  variant?: 'driver' | 'customer';
  showRoute?: boolean;
}

export const Map = ({
  startCoords,
  endCoords,
  showRoute = false,
  variant = 'customer',
}: MapProps) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const currentRoute = showRoute ? route : [];

  useEffect(() => {
    let active = true;
    const getRoute = async () => {
      if (!showRoute || !startCoords || startCoords[0] === 0) return;

      try {
        const coords = await fetchRoute(startCoords, endCoords);
        if (active) {
          setRoute(coords);
        }
      } catch (error) {
        console.error('error in Map components getRoute', error);
        setRoute([]);
      }
    };
    getRoute();

    return () => {
      active = false;
    };
  }, [startCoords, endCoords, showRoute]);

  const initialCenter =
    startCoords && startCoords[0] !== 0 ? startCoords : WAREHOUSE_COORDS;
  const watchPoints =
    currentRoute.length > 0 ? currentRoute : [initialCenter, endCoords];

  return (
    <MapContainer
      center={startCoords}
      zoom={8}
      style={{height: '100%', width: '100%', touchAction: 'none'}}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {startCoords && startCoords[0] !== 0 && (
        <>
          <Marker position={startCoords} icon={driverIcon}>
            <Popup>
              {variant === 'driver' ? 'Sinun sijaintisi' : 'Kuljettaja'}
            </Popup>
          </Marker>

          <Marker position={endCoords}>
            <Popup>Määränpää</Popup>
          </Marker>
        </>
      )}
      {showRoute && route.length > 0 && (
        <Polyline
          positions={route}
          pathOptions={{
            color: 'red',
            weight: 5,
            dashArray: variant === 'customer' ? '5, 10' : undefined,
            lineJoin: 'round',
          }}
        />
      )}
      <RouteWatcher coords={watchPoints as [number, number][]} />
    </MapContainer>
  );
};

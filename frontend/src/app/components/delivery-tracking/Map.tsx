/**
 * @fileoverview Generic Map Component.
 * Reusable map component used by drivers and customers to view routes and locations.
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

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as L.Icon.Default & {_getIconUrl?: unknown})
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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
  showMarkers?: boolean;
  orderSelected?: boolean;
}

export const Map = ({
  startCoords,
  endCoords,
  showRoute = false,
  showMarkers,
  variant = 'customer',
  orderSelected = false,
}: MapProps) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const currentRoute = showRoute ? route : [];

  useEffect(() => {
    let active = true;
    const getRoute = async () => {
      if (!showRoute || !startCoords || startCoords[0] === 0) return;

      try {
        const coords = await fetchRoute(startCoords, endCoords);
        if (active) setRoute(coords);
      } catch (error) {
        console.error('Error fetching route in Map component', error);
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
  const shouldShowMarkers =
    showMarkers || showRoute || (variant === 'customer' && orderSelected);

  return (
    <MapContainer
      center={initialCenter}
      zoom={8}
      style={{height: '100%', width: '100%', touchAction: 'none'}}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {shouldShowMarkers && startCoords && startCoords[0] !== 0 && (
        <>
          <Marker
            key={`driver-${startCoords[0]}-${startCoords[1]}`}
            position={startCoords}
            icon={driverIcon}
          >
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

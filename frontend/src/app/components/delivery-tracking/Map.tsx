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

const redIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  startCoords: [number, number]; // lat, lng
  endCoords: [number, number];
  showRoute?: boolean; // lat, lng
}

const HELSINKI: [number, number] = [60.1699, 24.9384];
export const Map = ({startCoords, endCoords, showRoute = false}: MapProps) => {
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
    startCoords && startCoords[0] !== 0 ? startCoords : HELSINKI;
  const watchPoints =
    currentRoute.length > 0 ? currentRoute : [initialCenter, endCoords];

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

      {startCoords && startCoords[0] !== 0 && (
        <>
          <Marker position={startCoords} icon={redIcon}>
            <Popup>Lähtöpiste</Popup>
          </Marker>

          <Marker position={endCoords}>
            <Popup>Kohde</Popup>
          </Marker>
        </>
      )}

      <Polyline
        positions={route}
        color="red"
        dashArray="5, 10"
        weight={5}
        opacity={0.7}
      />
      <RouteWatcher coords={watchPoints as [number, number][]} />
    </MapContainer>
  );
};

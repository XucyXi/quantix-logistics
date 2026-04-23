import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useEffect, useState} from 'react';
import {fetchRoute} from '../utils/osrmApi.ts';

interface MapProps {
  startCoords: [number, number]; // lat, lng
  endCoords: [number, number]; // lat, lng
}

const RouteWatcher = ({coords}: {coords: [number, number][]}) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      map.fitBounds(coords, {padding: [50, 50]});
    }
  }, [coords, map]);

  return null;
};

export const Map = ({startCoords, endCoords}: MapProps) => {
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    const getRoute = async () => {
      try {
        const coords = await fetchRoute(startCoords, endCoords);
        setRoute(coords);
      } catch (error) {
        console.log('error in Map components getRoute', error);
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

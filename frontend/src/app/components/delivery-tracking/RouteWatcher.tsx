import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import L from 'leaflet';

export const RouteWatcher = ({coords}: {coords: [number, number][]}) => {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.length > 0) {
      map.invalidateSize();

      const bounds = L.latLngBounds(coords);

      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [coords, map]);

  return null;
};

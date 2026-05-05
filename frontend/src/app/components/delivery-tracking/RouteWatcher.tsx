/**
 * @fileoverview Route Watcher Utility Component.
 * Invisible component that automatically fits the map bounds to perfectly encompass an array of coordinates.
 */

import {useEffect} from 'react';
import {useMap} from 'react-leaflet';

export const RouteWatcher = ({coords}: {coords: [number, number][]}) => {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.length > 0) {
      map.fitBounds(coords, {padding: [50, 50]});
    }
  }, [coords, map]);

  return null;
};

/**
 * @fileoverview OSRM Routing API Utility.
 * Fetches driving routes between two coordinates using the Open Source Routing Machine.
 */

/**
 * Fetches a driving route between two points.
 *
 * @param start - Starting coordinates [latitude, longitude].
 * @param end - Destination coordinates [latitude, longitude].
 * @returns An array of coordinates representing the route geometry.
 */
export const fetchRoute = async (
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> => {
  // OSRM expects coordinates in [longitude, latitude] format
  const startStr = `${start[1]},${start[0]}`;
  const endStr = `${end[1]},${end[0]}`;

  const url = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return [];
    }

    // Convert OSRM's [lng, lat] back to Leaflet's expected [lat, lng] format
    return data.routes[0].geometry.coordinates.map((c: number[]) => [
      c[1],
      c[0],
    ]);
  } catch (error) {
    console.error('Failed to fetch route from OSRM:', error);
    return [];
  }
};

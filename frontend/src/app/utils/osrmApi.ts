/**
 * Hakee reitin kahden pisteen välille OSRM:stä.
 * @param start - [lat, lng]
 * @param end - [lat, lng]
 * @returns Reittipisteet Leaflet-muodossa [lat, lng][]
 */
export const fetchRoute = async (
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> => {
  // OSRM haluaa [lng, lat]
  const startStr = `${start[1]},${start[0]}`;
  const endStr = `${end[1]},${end[0]}`;

  const url = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM virhe: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return [];
    }

    return data.routes[0].geometry.coordinates.map((c: number[]) => [
      c[1],
      c[0],
    ]);
  } catch (error) {
    console.error('fetchRoute epäonnistui:', error);
    return [];
  }
};

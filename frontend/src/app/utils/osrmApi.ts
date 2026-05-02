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

  const isValidCoord = (c: [number, number]) =>
    c &&
    typeof c[0] === 'number' &&
    !isNaN(c[0]) &&
    typeof c[1] === 'number' &&
    !isNaN(c[1]) &&
    Math.abs(c[0]) <= 90 &&
    Math.abs(c[1]) <= 180;

  if (!isValidCoord(start) || !isValidCoord(end)) {
    console.warn('fetchRoute: Virheelliset koordinaatit syötteessä', {
      start,
      end,
    });
    return [];
  }
  const url = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sekunnin aikaraja
  try {
    const response = await fetch(url, {signal: controller.signal});
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.error(`OSRM API vastasi virheellä: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (
      !data ||
      data.code !== 'Ok' ||
      !Array.isArray(data.routes) ||
      data.routes.length === 0 ||
      !data.routes[0].geometry?.coordinates
    ) {
      console.warn('OSRM palautti tyhjän tai virheellisen reitin');
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

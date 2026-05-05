/**
 * @fileoverview Geocoding Utility.
 * Converts a physical address into GPS coordinates (latitude and longitude)
 * using the OpenStreetMap Nominatim API.
 */

/**
 * Fetches coordinates for a given address, automatically scoping the search to Finland.
 *
 * @param {string} address - The street address to geocode.
 * @returns {Promise<{lat: number, lon: number} | null>} An object containing lat and lon, or null if not found.
 */
export default async function getCoords(address) {
  try {
    // Limit search to Finland for better accuracy
    const searchQuery = `${address}, Finland`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a valid, identifiable User-Agent
        'User-Agent': 'Quantix-Logistics-App',
      },
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }

    console.warn(`[Geocoder] Address not found on the map: ${address}`);
    return null;
  } catch (err) {
    console.error(
      `[Geocoder] Error during geocoding for "${address}":`,
      err.message
    );
    return null;
  }
}

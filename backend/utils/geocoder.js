//const fetch = require('node-fetch');

const getCoords = async (address) => {
  try {
    const searchQuery = `${address}, Finland`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    const response = await fetch(url, {
      headers: {'User-Agent': 'Quantix'},
    });
    const data = await response.json();
    console.log('haetut koordinaatit', data);
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    console.log('Osoitetta ei löytynyt kartalta.');
    return null;
  } catch (err) {
    console.error('Geokoodausvirhe:', err);
    return null;
  }
};

module.exports = getCoords;

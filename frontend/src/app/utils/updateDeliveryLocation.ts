export const updateDeliveryLocation = async (
  selectedOrderId,
  latitude,
  longitude
) => {
  console.log('päivitetään lokaatiota kantaan!');
};

/*
  orderId: number,
  lat: number,
  lng: number
) => {
  try {
    const response = await fetch(`/api/delivery/${orderId}/location`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        updated_at: new Date().toISOString(),
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Sijainnin päivitys epäonnistui:', error);
    return false;
  }
};
*/

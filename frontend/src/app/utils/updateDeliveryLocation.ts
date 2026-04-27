export const updateDeliveryLocation = async (
  orderId: number,
  latitude: number,
  longitude: number
) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`/api/deliveries/${orderId}/tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        status: 'in_transit',
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sijainnin päivitys epäonnistui');
    }

    console.log(
      `Sijainti päivitetty tilaukselle ${orderId}: ${latitude}, ${longitude}`
    );
  } catch (error) {
    console.error('Virhe sijainnin lähetyksessä bäkkiin:', error);
  }
};

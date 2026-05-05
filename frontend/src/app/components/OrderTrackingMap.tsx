import {useState, useEffect} from 'react';

interface OrderTrackingMapProps {
  orderId: number;
  token: string | null;
}

export function OrderTrackingMap({orderId, token}: OrderTrackingMapProps) {
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!token || !orderId) return;

    const fetchLocation = async () => {
      try {
        // Oletetaan, että backendissä on tämä reitti oppaan mukaisesti
        const res = await fetch(`/api/orders/${orderId}/tracking`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        if (data.location) {
          setDriverLocation(data.location);
        }
      } catch (err) {
        console.error('Error fetching tracking data:', err);
      }
    };

    const interval = setInterval(fetchLocation, 5000); // Päivitys 5s välein
    return () => clearInterval(interval);
  }, [orderId, token]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {driverLocation
        ? `Kuljettajan sijainti: ${driverLocation.lat}, ${driverLocation.lng}`
        : 'Odotetaan kuljettajan sijaintitietoa... (Karttaintegraatio tähän)'}
    </div>
  );
}

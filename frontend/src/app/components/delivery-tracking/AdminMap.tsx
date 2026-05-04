import {useEffect} from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

// Kuskin ikoni
const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Kohdeikoni
const destIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1409/1409036.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface ActiveDelivery {
  order_id: number;
  driver_lat: number;
  driver_lng: number;
  dest_lat: number;
  dest_lng: number;
  delivery_address: string;
}

// Apukomponentti kartan tarkentamiseen (Zoom)
function MapFitter({
  deliveries,
  selectedId,
}: {
  deliveries: ActiveDelivery[];
  selectedId: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (deliveries.length === 0) return;

    if (selectedId) {
      // Tarkennetaan valittuun toimitukseen ja sen määränpäähän
      const selected = deliveries.find((d) => d.order_id === selectedId);
      if (selected && selected.dest_lat) {
        const bounds = L.latLngBounds([
          [selected.driver_lat, selected.driver_lng],
          [selected.dest_lat, selected.dest_lng],
        ]);
        map.fitBounds(bounds, {padding: [50, 50]});
      } else if (selected) {
        map.setView([selected.driver_lat, selected.driver_lng], 14);
      }
    } else {
      // Näytetään KAIKKI kuskit
      const bounds = L.latLngBounds(
        deliveries.map((d) => [d.driver_lat, d.driver_lng])
      );
      map.fitBounds(bounds, {padding: [50, 50], maxZoom: 14});
    }
  }, [deliveries, selectedId, map]);

  return null;
}

export function AdminMap({
  deliveries,
  selectedId,
}: {
  deliveries: ActiveDelivery[];
  selectedId: number | null;
}) {
  // Keskitetään Suomeen aluksi, jos ei dataa
  const defaultCenter: [number, number] = [60.205, 24.887];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      style={{height: '100%', width: '100%', zIndex: 0}}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

      <MapFitter deliveries={deliveries} selectedId={selectedId} />

      {deliveries.map((del) => {
        const isSelected = selectedId === del.order_id;
        // Jos jokin tilaus on valittu, piilotetaan muut kuskit himmeämmiksi tai jätetään ne ennalleen
        const opacity = selectedId === null || isSelected ? 1 : 0.4;

        return (
          <div key={del.order_id}>
            {/* Kuskin markkeri */}
            <Marker
              position={[del.driver_lat, del.driver_lng]}
              icon={driverIcon}
              opacity={opacity}
            >
              <Popup>
                <b>Tilaus #{del.order_id}</b>
                <br />
                Osoite: {del.delivery_address}
              </Popup>
            </Marker>

            {/* Piirretään reitti ja kohde VAIN valitulle toimitukselle */}
            {isSelected && del.dest_lat && del.dest_lng && (
              <>
                <Marker position={[del.dest_lat, del.dest_lng]} icon={destIcon}>
                  <Popup>Määränpää: {del.delivery_address}</Popup>
                </Marker>
                <Polyline
                  positions={[
                    [del.driver_lat, del.driver_lng],
                    [del.dest_lat, del.dest_lng],
                  ]}
                  color="#3b82f6"
                  weight={4}
                  dashArray="10, 10"
                />
              </>
            )}
          </div>
        );
      })}
    </MapContainer>
  );
}

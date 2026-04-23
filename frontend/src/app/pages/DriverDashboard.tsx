import {useState} from 'react';
import {Map} from '../components/Map';
import {fetchRoute} from '../utils/osrmApi';

// Tähän mokatut tilaukset, kunnes bäkki on valmis
const MOCK_DELIVERIES = [
  {
    id: 1,
    address: 'Mannerheimintie 10',
    coords: [60.1699, 22.9384] as [number, number],
  },
  {id: 2, address: 'Hämeentie 1', coords: [60.18, 24.1] as [number, number]},
  {id: 3, address: 'Hämeentie 1', coords: [60.18, 24.1] as [number, number]},

  {id: 4, address: 'Hämeentie 1', coords: [60.18, 24.1] as [number, number]},
  {id: 5, address: 'Hämeentie 1', coords: [60.18, 24.1] as [number, number]},
];

export function DriverDashboard() {
  const [selectedDelivery, setSelectedDelivery] = useState(MOCK_DELIVERIES[0]);

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1rem',
          background: 'white',
          borderBottom: '1px solid #ddd',
        }}
      >
        <h1 style={{fontSize: '1.5rem', margin: 0}}>Kuljettaja</h1>
      </div>

      <div style={{flex: 1, position: 'relative'}}>
        <Map
          startCoords={[60.1699, 24.9384]}
          endCoords={selectedDelivery.coords}
        />
      </div>

      <div
        style={{
          padding: '1rem',
          background: '#f8fafc',
          borderTop: '2px solid #e2e8f0',
          maxHeight: '35vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1rem'}}>Tilaukset</h3>

        {MOCK_DELIVERIES.map((delivery) => (
          <div
            key={delivery.id}
            onClick={() => setSelectedDelivery(delivery)}
            style={{
              padding: '1rem',
              background:
                selectedDelivery.id === delivery.id ? 'white' : '#f1f5f9',
              border: '1px solid',
              borderColor:
                selectedDelivery.id === delivery.id ? '#3b82f6' : '#e2e8f0',
              borderRadius: '8px',
              flexShrink: 0,
            }}
          >
            <strong>Tilaus #{delivery.id}</strong>
            <div style={{fontSize: '0.85rem', color: '#64748b'}}>
              {delivery.address}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

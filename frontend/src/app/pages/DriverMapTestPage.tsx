// src/pages/DriverMapTestPage.tsx
import {Map} from '../components/Map';
import {useState} from 'react';

export const DriverMapTestPage = () => {
  const locations = {
    warehouse: [60.1699, 24.9384] as [number, number],
    customerA: [60.2006, 24.9343] as [number, number],
    customerB: [60.18, 24.85] as [number, number],
  };

  const [currentTarget, setCurrentTarget] = useState(locations.customerB);

  return (
    <div style={{padding: '20px'}}>
      <h1>Leaflet & Routing Test</h1>
      <p>Tällä sivulla testataan reititystä varastolta eri kohteisiin.</p>

      <div style={{marginBottom: '10px'}}>
        <button onClick={() => setCurrentTarget(locations.customerA)}>
          Kohde A (Pasila)
        </button>
        <button
          onClick={() => setCurrentTarget(locations.customerB)}
          style={{marginLeft: '10px'}}
        >
          Kohde B (Otaniemi)
        </button>
      </div>

      <div style={{height: '60vh', border: '2px solid black'}}>
        <Map startCoords={locations.warehouse} endCoords={currentTarget} />
      </div>
    </div>
  );
};

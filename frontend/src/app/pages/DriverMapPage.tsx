import {useState, useEffect} from 'react';
import {MapPin, AlertCircle, Map as MapIcon} from 'lucide-react';
import {orderService} from '../services/orderService';

interface DeliveryCoords {
  order_id: number;
  delivery_address: string;
  customer_name: string;
}

interface BackendAssignedOrder {
  order_id: number;
  delivery_address: string;
  customer: {
    company_name: string | null;
  };
}

export function DriverMapPage() {
  const [locations, setLocations] = useState<DeliveryCoords[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Haetaan omat aktiiviset tilaukset
        const data = await orderService.getAssignedOrders();

        // Mapatataan vain tarpeellinen tieto kartalle (käytetään oikeaa tyyppiä 'any' sijaan)
        const mapped = data.map((o: BackendAssignedOrder) => ({
          order_id: o.order_id,
          delivery_address: o.delivery_address,
          customer_name: o.customer.company_name || 'Asiakas',
        }));

        setLocations(mapped);
      } catch (error) {
        console.error('Karttatietojen lataus epäonnistui', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Informatiivinen yläpalkki kartan päällä */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f2444',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <MapIcon size={24} color="#f97316" /> Live-Reitti
        </h1>
        <p
          style={{
            color: '#64748b',
            fontSize: '0.9rem',
            margin: '0.25rem 0 0 0',
          }}
        >
          Sinulla on {locations.length} toimituspistettä reitilläsi.
        </p>
      </div>

      {/* TÄHÄN TULEE KAVERIN KARTTAKOMPONENTTI */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <div className="text-slate-500 font-medium animate-pulse">
            Ladataan koordinaatteja...
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center text-slate-400">
            <MapPin size={48} className="mx-auto mb-2 opacity-50" />
            <p>Ei reittejä kartalla.</p>
          </div>
        ) : (
          <div className="text-center p-6 bg-white rounded-2xl shadow-xl max-w-sm border border-slate-200">
            <AlertCircle size={40} className="mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Kartta puuttuu!
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Tämä on paikkavaraus. Kaverisi voi pudottaa karttakomponenttinsa
              tähän div-elementtiin. Datan (locations) voi antaa suoraan
              kartalle propseina!
            </p>
            <div className="text-left bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-600 overflow-hidden">
              {JSON.stringify(locations[0], null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
        const data = await orderService.getAssignedOrders();
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
    <div className="flex flex-col h-full font-sans">
      {/* Informatiivinen yläpalkki kartan päällä */}
      <div className="p-6 bg-card border-b border-border z-10 shadow-sm">
        <h1 className="text-2xl font-extrabold text-foreground m-0 flex items-center gap-2">
          <MapIcon size={24} className="text-primary" /> Live-Reitti
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sinulla on {locations.length} toimituspistettä reitilläsi.
        </p>
      </div>

      {/* TÄHÄN TULEE KAVERIN KARTTAKOMPONENTTI */}
      <div className="flex-1 relative bg-muted flex items-center justify-center">
        {loading ? (
          <div className="text-muted-foreground font-medium animate-pulse">
            Ladataan koordinaatteja...
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <MapPin size={48} className="mx-auto mb-2 opacity-50" />
            <p>Ei reittejä kartalla.</p>
          </div>
        ) : (
          <div className="text-center p-6 bg-card rounded-2xl shadow-xl max-w-sm border border-border">
            <AlertCircle size={40} className="mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Kartta puuttuu!
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Tämä on paikkavaraus. Kaverisi voi pudottaa karttakomponenttinsa
              tähän div-elementtiin. Datan (locations) voi antaa suoraan
              kartalle propseina!
            </p>
            <div className="text-left bg-muted p-3 rounded-lg text-xs font-mono text-muted-foreground overflow-hidden">
              {JSON.stringify(locations[0], null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import {Outlet} from 'react-router-dom';

export function StoreRoot() {
  return (
    // Kauppanäkymä on rakenteeltaan sama kuin kuljettajalla: kevyt runko ja sisältö keskellä.
    <main style={{minHeight: '100%', background: '#f8fafc'}}>
      {/* Kaupan sivun sisältö renderöidään tähän. */}
      <Outlet />
    </main>
  );
}

import {Outlet} from 'react-router-dom';

export function DriverRoot() {
  return (
    // Kuljettajanäkymä käyttää kevyttä layoutia ilman sivupalkkia.
    <main style={{minHeight: '100%', background: '#f8fafc'}}>
      {/* Kuljettajan sivun sisältö tulee tähän. */}
      <Outlet />
    </main>
  );
}

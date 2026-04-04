import {Outlet} from 'react-router';
import {Navbar} from './Navbar';
import {Footer} from './Footer';

// Peruslayout: navbar ylös, footer alas, sisältö Outletiin.
export function Root() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Navbar />
      <main style={{flex: 1}}>
        {/* Outlet renderöi kulloinkin aktiivisen lapsireitin sisällön layoutin sisään. */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

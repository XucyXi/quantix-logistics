import {Outlet} from 'react-router';
import {Navbar} from '../components/layout/Navbar';
import {Footer} from '../components/layout/Footer';

export function Root() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Navbar />
      <main style={{flex: 1}}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

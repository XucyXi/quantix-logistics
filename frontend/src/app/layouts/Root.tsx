import {Outlet} from 'react-router';
import {Navbar} from '../components/layout/Navbar';
import {Footer} from '../components/layout/Footer';

export function Root() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

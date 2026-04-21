import {useEffect} from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import {Footer} from '../components/layout/Footer';
import {Navbar} from '../components/layout/Navbar';

export function Root() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
  }, [location.pathname]);

  return (
    // Yhteinen runko: ylävalikko ylös, sisältö keskelle, footer alas.
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* Navbar on näkyvissä kaikilla tämän layoutin reiteillä. */}
      <Navbar />
      <main style={{flex: 1}}>
        {/* Outlet renderöi nykyisen lapsireitin sisällön tähän kohtaan. */}
        <Outlet />
      </main>
      {/* Footer pysyy sivun alareunassa myös lyhyillä sivuilla. */}
      <Footer />
    </div>
  );
}

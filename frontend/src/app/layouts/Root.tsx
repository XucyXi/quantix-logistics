import {Outlet} from 'react-router-dom';
import {ChatBot} from '../components/layout/ChatBot';
import {Footer} from '../components/layout/Footer';
import {Navbar} from '../components/layout/Navbar';

export function Root() {
  return (
    // Yhteinen runko: ylävalikko ylös, sisältö keskelle, footer alas.
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* Navbar on näkyvissä kaikilla tämän layoutin reiteillä. */}
      <Navbar />
      <main style={{flex: 1}}>
        {/* Outlet renderöi nykyisen lapsireitin sisällön tähän kohtaan. */}
        <Outlet />
      </main>
      <ChatBot />
      {/* Footer pysyy sivun alareunassa myös lyhyillä sivuilla. */}
      <Footer />
    </div>
  );
}

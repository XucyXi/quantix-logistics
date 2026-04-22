import {Outlet} from 'react-router-dom';
import {Sidebar} from '../components/Sidebar';

export function AdminRoot() {
  return (
    // Admin-puolella on oma sivupalkki ja siihen kytketyt alasivut.
    <div style={{display: 'flex', minHeight: '100%'}}>
      <Sidebar />
      <main style={{flex: 1, background: '#f8fafc'}}>
        {/* Outlet vaihtaa sisällön admin-alareittien mukaan. */}
        <Outlet />
      </main>
    </div>
  );
}

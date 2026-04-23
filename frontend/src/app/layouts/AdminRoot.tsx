import {Outlet} from 'react-router-dom';
import {Sidebar} from '../components/Sidebar';
import {LayoutDashboard} from 'lucide-react';

const adminNavItems = [
  {to: '/admin', icon: LayoutDashboard, label: 'Dashboard'},
];

export function AdminRoot() {
  return (
    // Admin-puolella on oma sivupalkki ja siihen kytketyt alasivut.
    <div style={{display: 'flex', minHeight: '100%'}}>
      <Sidebar navItems={adminNavItems} />
      <main style={{flex: 1, background: '#f8fafc'}}>
        {/* Outlet vaihtaa sisällön admin-alareittien mukaan. */}
        <Outlet />
      </main>
    </div>
  );
}

import {Navigate, Route, Routes} from 'react-router-dom';
import {AdminRoot} from './layouts/AdminRoot';
import {DriverRoot} from './layouts/DriverRoot';
import {Root} from './layouts/Root';
import {StoreRoot} from './layouts/StoreRoot';
import {AdminDashboard} from './pages/AdminDashboard';
import {AdminLogin} from './pages/AdminLogin';
import {CartPage} from './pages/CartPage';
import {DriverDashboard} from './pages/DriverDashboard';
import {ExampleTablePage} from './pages/ExampleTablePage';
import {LandingPage} from './pages/LandingPage';
import {LoginPage} from './pages/LoginPage';
import {PricingPage} from './pages/PricingPage';
import {ProductsPage} from './pages/ProductsPage';
import {RegisterPage} from './pages/RegisterPage';
import {StoreDashboard} from './pages/StoreDashboard';

export function AppRoutes() {
  return (
    // Kaikki reitit keskitetään tänne, jotta navigaatio on yhdessä paikassa.
    <Routes>
      {/* Root on yhteinen layout, joka lisää Navbarin ja Footerin kaikille alasivuille. */}
      <Route element={<Root />}>
        {/* Etusivu avautuu juuripolusta / */}
        <Route index element={<LandingPage />} />
        {/* Julkiset sivut */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        {/* Adminin alireitit pidetään omassa haarassaan */}
        <Route path="admin" element={<AdminRoot />}>
          <Route index element={<AdminDashboard />} />
          <Route path="login" element={<AdminLogin />} />
        </Route>
        {/* Muut roolikohtaiset dashboardit */}
        <Route path="driver" element={<DriverRoot />}>
          <Route index element={<DriverDashboard />} />
        </Route>
        <Route path="store" element={<StoreRoot />}>
          <Route index element={<StoreDashboard />} />
        </Route>
        {/* Esimerkkisivu taulukolle tai demoille */}
        <Route path="example-table" element={<ExampleTablePage />} />
        {/* Tuntematon polku ohjataan takaisin etusivulle */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

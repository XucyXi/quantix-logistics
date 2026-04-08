import {createBrowserRouter} from 'react-router';

// 1. AKTIIVISET IMPORTIT (Vain ne mitä on jo koodattu)
import {Root} from './components/layout/Root';
import {LandingPage} from './pages/LandingPage';
import {ProductsPage} from './pages/ProductsPage';

/* ===================================================================
2. TULEVAT IMPORTIT (Kommentoitu piiloon, kunnes sivut on tehty)
===================================================================

import { redirect } from 'react-router';
import { AdminRoot } from './layouts/AdminRoot';
import { DriverRoot } from './layouts/DriverRoot';
import { StoreRoot } from './layouts/StoreRoot';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { StoreDashboard } from './pages/StoreDashboard';
*/

// 3. REITTITIEN MÄÄRITTELY
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />, // Root käärii sisälleen Navigoinnin ja Footerin
    children: [
      {
        index: true, // Tämä tarkoittaa juuripolkua "/" (Etusivu)
        element: <LandingPage />,
      },
      {
        path: 'tuotteet', // Tämä on polku "/tuotteet"
        element: <ProductsPage />,
      },

      /* ===================================================================
      4. TULEVAT REITIT (Otetaan käyttöön yksi kerrallaan myöhemmin)
      ===================================================================

      {
        path: "hinnoittelu",
        element: <PricingPage />,
      },
      {
        path: "kirjaudu",
        element: <LoginPage />,
      },
      {
        path: "rekisteroidy",
        element: <RegisterPage />,
      },
      {
        path: "ostoskori",
        element: <CartPage />,
      },
      */
    ],
  },

  /*
  ===================================================================
  5. ERILILLISET KÄYTTÖLIITTYMÄT (Esim. Hallintapaneeli)
  ===================================================================

  {
    path: "/admin",
    element: <AdminRoot />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "login",
        element: <AdminLogin />,
      }
    ]
  },
  {
    path: "/driver",
    element: <DriverRoot />,
    children: [
      {
        index: true,
        element: <DriverDashboard />,
      }
    ]
  }
  */
]);

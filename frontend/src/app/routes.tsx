import {createBrowserRouter} from 'react-router';
import {Root} from './layouts/Root';
import {AdminRoot} from './layouts/AdminRoot';
import {DriverRoot} from './layouts/DriverRoot';
import {StoreRoot} from './layouts/StoreRoot';
import {LandingPage} from './pages/LandingPage';
import {AboutPage} from './pages/AboutPage.tsx';
import {ProductsPage} from './pages/ProductsPage';
import {PricingPage} from './pages/PricingPage';
import {LoginPage} from './pages/LoginPage';
import {RegisterPage} from './pages/RegisterPage';
import {CartPage} from './pages/CartPage';
import {AdminLogin} from './pages/AdminLogin';
import {AdminDashboard} from './pages/AdminDashboard';
import {DriverDashboard} from './pages/DriverDashboard';
import {StoreDashboard} from './pages/StoreDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      {index: true, Component: LandingPage},
      {path: 'meista', Component: AboutPage},
      {path: 'tuotteet', Component: ProductsPage},
      {path: 'hinnoittelu', Component: PricingPage},
      {path: 'Kirjaudu', Component: LoginPage},
      {path: 'kirjaudu', Component: LoginPage},
      {path: 'login', Component: LoginPage},
      {path: 'Rekisteröidy', Component: RegisterPage},
      {path: 'rekisteröidy', Component: RegisterPage},
      {path: 'register', Component: RegisterPage},
      {path: 'ostoskori', Component: CartPage},
      {path: 'cart', Component: CartPage},
      {path: 'products', Component: ProductsPage},
      {path: 'pricing', Component: PricingPage},
    ],
  },
  {
    path: '/admin',
    Component: AdminRoot,
    children: [{index: true, Component: AdminDashboard}],
  },
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/driver',
    Component: DriverRoot,
    children: [{index: true, Component: DriverDashboard}],
  },
  {
    path: '/kuljettaja',
    Component: DriverRoot,
    children: [{index: true, Component: DriverDashboard}],
  },
  {
    path: '/store',
    Component: StoreRoot,
    children: [{index: true, Component: StoreDashboard}],
  },
  {
    path: '/tuotetiedot',
    Component: StoreRoot,
    children: [{index: true, Component: StoreDashboard}],
  },
]);

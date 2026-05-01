import {createBrowserRouter} from 'react-router';
import {Root} from './layouts/Root';
import {AdminRoot} from './layouts/AdminRoot';
import {DriverRoot} from './layouts/DriverRoot';
import {StoreRoot} from './layouts/StoreRoot';
import {LandingPage} from './pages/LandingPage';
import {AboutPage} from './pages/AboutPage';
import {ProductsPage} from './pages/ProductsPage';
import {PricingPage} from './pages/PricingPage';
import {LoginPage} from './pages/AdminLoginPage';
import {RegisterPage} from './pages/RegisterPage';
import {ForgotPasswordPage} from './pages/ForgotPassword';
import {CartPage} from './pages/CartPage';
import {AdminLogin} from './pages/AdminLogin';
import {AdminDashboard} from './pages/AdminDashboard';
import {RoutesPage} from './pages/RoutesPage';
import {OrdersPage} from './pages/OrdersPage';
//import {StoresPage} from './pages/StoresPage';
import {UsersPage} from './pages/UsersPage';
import {ReportsPage} from './pages/ReportsPage';
import {SettingsPage} from './pages/SettingsPage';
import {LiveMapPage} from './pages/LiveMapPage';
import {DriverDashboard} from './pages/DriverDashboard';
import {DriverDeliveriesPage} from './pages/DriverDeliversPage';
import {DriverMapPage} from './pages/DriverMapPage';
import {DriverProfilePage} from './pages/DriverProfilePage';
import {StoreDashboard} from './pages/StoreDashboard';
import {DriverMapTestPage} from './pages/DriverMapTestPage';
import {DeliveryManager} from './components/delivery-tracking/DeliveryManager';
import {CustomerTrackingView} from './components/delivery-tracking/CustomerTrackingView';
import {AdminProductsPage} from './pages/AdminProductsPage';
import {CustomerDashboard} from './pages/CustomerDashboard';

const loadLandingPage = async () => {
  const module = await import('./pages/LandingPage');
  return {Component: module.LandingPage};
};

const loadAboutPage = async () => {
  const module = await import('./pages/AboutPage');
  return {Component: module.AboutPage};
};

const loadProductsPage = async () => {
  const module = await import('./pages/ProductsPage');
  return {Component: module.ProductsPage};
};

const loadPricingPage = async () => {
  const module = await import('./pages/PricingPage');
  return {Component: module.PricingPage};
};

const loadLoginPage = async () => {
  const module = await import('./pages/AdminLoginPage');
  return {Component: module.LoginPage};
};

const loadRegisterPage = async () => {
  const module = await import('./pages/RegisterPage');
  return {Component: module.RegisterPage};
};

const loadCartPage = async () => {
  const module = await import('./pages/CartPage');
  return {Component: module.CartPage};
};

const loadAdminLogin = async () => {
  const module = await import('./pages/AdminLogin');
  return {Component: module.AdminLogin};
};

const loadAdminDashboard = async () => {
  const module = await import('./pages/AdminDashboard');
  return {Component: module.AdminDashboard};
};

const loadDriverDashboard = async () => {
  const module = await import('./pages/DriverDashboard');
  return {Component: module.DriverDashboard};
};

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      {index: true, Component: LandingPage},
      {path: 'about', Component: AboutPage},
      {path: 'products', Component: ProductsPage},
      {path: 'pricing', Component: PricingPage},
      {path: 'login', Component: LoginPage},
      {path: 'register', Component: RegisterPage},
      {path: 'forgot-password', Component: ForgotPasswordPage},
      {path: 'cart', Component: CartPage},
    ],
  },
  {
    path: '/admin',
    Component: AdminRoot,
    children: [
      {index: true, Component: AdminDashboard},
      {path: 'routes', Component: RoutesPage},
      {path: 'live-map', Component: LiveMapPage},
      {path: 'orders', Component: OrdersPage},
      //{path: 'stores', Component: StoresPage},
      {path: 'users', Component: UsersPage},
      {path: 'products', Component: AdminProductsPage},
      {path: 'reports', Component: ReportsPage},
      {path: 'settings', Component: SettingsPage},
    ],
  },
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/driver',
    Component: DriverRoot,
    children: [
      {index: true, Component: DriverDashboard},
      {path: 'deliveries', Component: DriverDeliveriesPage},
      {path: 'map', Component: DeliveryManager},
      {path: 'profile', Component: DriverProfilePage},
    ],
  },
  {
    path: '/customer',
    Component: StoreRoot,
    children: [{index: true, Component: CustomerDashboard}],
  },
  {
    path: '/kuljettaja',
    Component: DriverRoot,
    children: [{index: true, lazy: loadDriverDashboard}],
  },

  {
    path: '/user/maptest',
    Component: CustomerTrackingView,
  },
]);

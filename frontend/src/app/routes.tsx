import {createBrowserRouter} from 'react-router';
import {Root} from './layouts/Root';
import {AdminRoot} from './layouts/AdminRoot';
import {DriverRoot} from './layouts/DriverRoot';

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
  const module = await import('./pages/LoginPage');
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
      {index: true, lazy: loadLandingPage},
      {path: 'meista', lazy: loadAboutPage},
      {path: 'tuotteet', lazy: loadProductsPage},
      {path: 'hinnoittelu', lazy: loadPricingPage},
      {path: 'Kirjaudu', lazy: loadLoginPage},
      {path: 'kirjaudu', lazy: loadLoginPage},
      {path: 'login', lazy: loadLoginPage},
      {path: 'Rekisteröidy', lazy: loadRegisterPage},
      {path: 'rekisteröidy', lazy: loadRegisterPage},
      {path: 'register', lazy: loadRegisterPage},
      {path: 'ostoskori', lazy: loadCartPage},
      {path: 'cart', lazy: loadCartPage},
      {path: 'products', lazy: loadProductsPage},
      {path: 'pricing', lazy: loadPricingPage},
    ],
  },
  {
    path: '/admin',
    Component: AdminRoot,
    children: [{index: true, lazy: loadAdminDashboard}],
  },
  {
    path: '/admin/login',
    lazy: loadAdminLogin,
  },
  {
    path: '/driver',
    Component: DriverRoot,
    children: [{index: true, lazy: loadDriverDashboard}],
  },
  {
    path: '/kuljettaja',
    Component: DriverRoot,
    children: [{index: true, lazy: loadDriverDashboard}],
  },
]);

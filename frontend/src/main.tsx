import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './assets/styles/index.css';
import {ToastProvider} from './app/contexts/ToastContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);

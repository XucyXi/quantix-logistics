import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './assets/styles/index.css';
import {ThemeProvider} from './app/contexts/ThemeProvider';
import {ToastProvider} from './app/contexts/ToastContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Kääritään koko App ThemeProvideriin, jotta teema on käytössä kaikkialla */}
    <ThemeProvider defaultTheme="system" storageKey="quantix-theme">
      {/* Kääritään App myös ToastProvideriin */}
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);

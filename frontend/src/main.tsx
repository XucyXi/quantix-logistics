import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './assets/styles/index.css';
import {ThemeProvider} from './app/contexts/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Kääritään koko App ThemeProvideriin, jotta teema on käytössä kaikkialla */}
    <ThemeProvider defaultTheme="system" storageKey="quantix-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

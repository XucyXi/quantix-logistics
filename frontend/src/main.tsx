import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Luodaan React-sovelluksen juurielementti #root-diviin ja renderöidään koko App-komponenttipuu siihen.
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode auttaa kehityksessä havaitsemaan vanhentuneita käytäntöjä ja sivuvaikutuksia.
  <React.StrictMode>
    {/* App on sovelluksen varsinainen juurikomponentti (reitit, layoutit, kontekstit). */}
    <App />
  </React.StrictMode>
);

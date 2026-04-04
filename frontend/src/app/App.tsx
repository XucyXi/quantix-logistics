import {BrowserRouter} from 'react-router-dom';
import {Navbar} from './components/layout/Navbar';
import {AuthProvider} from './contexts/AuthContext';
import {CartProvider} from './contexts/CartContext';
import {LandingPage} from './pages/LandingPage';
import '../styles/index.css';

export default function App() {
  return (
    // Router + contextit pidetaan Appin juuritasolla,
    // jotta kaikki alikomponentit saavat tarvittavan tilan.
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <LandingPage />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

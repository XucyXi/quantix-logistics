import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {CartProvider} from './contexts/CartContext';
import {AppRoutes} from './routes';
import '../styles/index.css';

export default function App() {
  return (
    // BrowserRouter pitää URL-osoitteen ja näkymän synkassa koko sovelluksessa.
    <BrowserRouter>
      {/* AuthProvider ja CartProvider ympäröivät koko appia, jotta tila säilyy reiteillä. */}
      <AuthProvider>
        <CartProvider>
          {/* AppRoutes määrittää, mikä sivu renderöidään nykyisen reitin mukaan. */}
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

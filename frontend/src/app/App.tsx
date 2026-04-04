import {BrowserRouter} from 'react-router-dom';
import {Navbar} from './components/layout/Navbar';
import {AuthProvider} from './contexts/AuthContext';
import {CartProvider} from './contexts/CartContext';
import {LandingPage} from './pages/LandingPage';
import '../styles/index.css';

export default function App() {
  return (
    // Providerit on tarkoituksella juuritasolla: näin sama kirjautumis- ja ostoskoritila
    // pysyy yhtenäisenä reitistä riippumatta eikä nollaannu sivua vaihdettaessa.
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Navbar on globaali UI-osa, joten se renderöidään ennen sivukohtaista sisältöä. */}
          <Navbar />
          <LandingPage />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import {RouterProvider} from 'react-router';
import {CartProvider} from './contexts/CartContext';
import {AuthProvider} from './contexts/AuthContext';
import {router} from './routes';
import '../styles/fonts.css';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

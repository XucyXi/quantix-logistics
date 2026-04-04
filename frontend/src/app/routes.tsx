import {createBrowserRouter, redirect} from 'react-router';
import {LandingPage} from './pages/LandingPage';

// Keskitetty reititysmäärittely, jota voidaan laajentaa myöhemmin roolikohtaisiin näkymiin.
export const router = createBrowserRouter([
  {
    // Julkinen etusivu.
    path: '/',
    Component: LandingPage,
  },
  {
    // Fallback: jos URL ei täsmää mihinkään tunnettuun reittiin, ohjataan etusivulle.
    // Tämä estää käyttäjää jäämästä tyhjälle sivulle esimerkiksi vanhalla bookmarkilla.
    path: '*',
    loader: () => redirect('/'),
  },
]);

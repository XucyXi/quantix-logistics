/**
 * @file api.ts
 * @description Kustomoitu Axios-instanssi Quantix Logistics -sovellukselle.
 * * 🚨 KÄYTTÖOHJE KEHITTÄJILLE:
 * Älä käytä enää puhdasta 'axios' -kirjastoa tai 'fetch' -komentoja, kun
 * teet kutsuja meidän omaan backendiimme. Tuo tämä instanssi käyttöön:
 * import api from '../lib/api';
 * * Tämä instanssi hoitaa taustalla automaattisesti:
 * 1. Oikean backend-osoitteen (lokaali tai tuotanto) + '/api/v1' -etuliitteen.
 * 2. Access Tokenin lisäämisen jokaisen pyynnön Authorization-headeriin.
 * 3. Tokenin automaattisen uusimisen (Refresh Token), jos se on vanhentunut.
 * * @example
 * // Oikea tapa hakea dataa:
 * const response = await api.get('/orders');
 * // -> tekee oikeasti pyynnön: http://localhost:3000/api/v1/orders
 * * HUOM: Jos haet dataa ulkopuolisista rajapinnoista (esim. Mapbox, sää-API),
 * käytä tavallista fetch() -komentoa, jotta et vuoda sisäänkirjautumistokenia.
 *
 * // Mahdollistaa .env käytön API_URL:lään
 */

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// Haetaan osoite ympäristömuuttujista (fallbackina localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Laajennetaan Axiosin omaa config-tyyppiä, jotta TS ymmärtää meidän _retry -lipun
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Luodaan oma Axios-instanssi
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
});

// Request Interceptor: Lisätään Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Otetaan kiinni 401-virheet
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Castataan config meidän omaan tyyppiin
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Varmistetaan, että config on olemassa ja vältetään ikilooppi
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken = response.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Sessio vanhentunut, heitetään ulos');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

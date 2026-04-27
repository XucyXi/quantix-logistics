import axios from 'axios';

// 1. Luodaan oma Axios-instanssi
const api = axios.create({
  baseURL: 'https://teidan-backend.fi',
  withCredentials: true // TÄRKEÄÄ: Mahdollistaa HttpOnly-evästeiden kulkemisen
});

// 2. Request Interceptor: Lisätään Access Token aina mukaan jokaiseen pyyntöön
api.interceptors.request.use(
  (config) => {
    // Hae Access Token sieltä minne sen tallennat (esim. localStorage tai Zustand/Redux)
    const accessToken = localStorage.getItem('accessToken'); 
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Otetaan kiinni 401-virheet ja haetaan uusi token
api.interceptors.response.use(
  (response) => response, // Kaikki meni hyvin, palautetaan data heti
  async (error) => {
    const originalRequest = error.config;

    // Jos virhe on 401 (Unauthorized) ja tätä pyyntöä ei ole vielä yritetty uudelleen
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Merkitään, ettei mennä ikuiseen luuppiin

      try {
        // Pyydetään backendiltä hiljaa taustalla uusi Access Token
        // Refresh token menee automaattisesti mukana evästeenä (withCredentials ansiosta)
        const response = await axios.post('https://teidan-backend.fi/api/v1/auth/refresh', {}, {
          withCredentials: true
        });
        
        const newAccessToken = response.data.accessToken;

        // Tallennetaan uusi Access Token käyttöön
        localStorage.setItem('accessToken', newAccessToken);

        // Päivitetään alkuperäiseen, äsken epäonnistuneeseen pyyntöön tämä uusi token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Yritetään alkuperäistä pyyntöä (esim. sitä tuotteen tallennusta) uudelleen!
        return api(originalRequest);
        
      } catch (refreshError) {
        // Jos tämäkin epäonnistuu (Refresh Token on vanhentunut), käyttäjä pitää kirjautua ulos
        console.error('Sessio vanhentunut, heitetään ulos');
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // Ohjataan kirjautumissivulle
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

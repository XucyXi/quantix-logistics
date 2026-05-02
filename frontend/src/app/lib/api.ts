import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// (REQUEST INTERCEPTOR) Lisätään token jokaiseen lähtevään pyyntöön
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('quantix_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// (RESPONSE INTERCEPTOR) Siepataan virheet ja yritetään refresh-tokenia
api.interceptors.response.use(
  (response) => response, // Jos kaikki menee hyvin, palautetaan data normaalisti
  async (error) => {
    const originalRequest = error.config;

    // Jos virhe on 401 (Unauthorized) ja emme ole vielä yrittäneet uudelleen
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Estetään ikuinen looppi

      try {
        const token =
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('quantix_token');

        // Pyydetään uusi token backendistä.
        // Hu-OM!: Käytämme puhdasta axios.post -kutsua tässä, jotta emme laukaise näitä interceptoreita uudelleen!!
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {Authorization: `Bearer ${token}`},
          }
        );

        if (refreshResponse.data.success && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;

          // Tallennetaan uusi token
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem('token', newToken);
          localStorage.setItem('quantix_token', newToken);

          // Päivitetään alkuperäiseen, epäonnistuneeseen pyyntöön uusi token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Yritetään alkuperäistä pyyntöä uudelleen
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Jos myös refresh epäonnistuu (token on kokonaan kuollut), siivotaan jäljet ja heitetään se sitten u-l-o-s!
        console.error(
          'Auto-refresh epäonnistui, kirjaudutaan ulos.',
          refreshError
        );
        localStorage.removeItem('quantix_user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('quantix_token');

        // Ohjataan käyttäjä etusivulle/login-sivulle
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // Jos virhe oli jokin muu kuin 401, jatketaan eteenpäin normaalisti
    return Promise.reject(error);
  }
);

export default api;

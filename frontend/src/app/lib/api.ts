import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// (REQUEST INTERCEPTOR) Lisätään token jokaiseen lähtevään pyyntöön
api.interceptors.request.use(
  (config) => {
    // Haetaan ensisijaisesti dokumentaation mukaista quantix_tokenia
    const token =
      localStorage.getItem('quantix_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// (RESPONSE INTERCEPTOR) Siepataan virheet ja yritetään refresh-tokenia
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jos virhe on 401 (Unauthorized) ja emme ole vielä yrittäneet uudelleen
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token =
          localStorage.getItem('quantix_token') ||
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token');

        // Pyydetään uusi token backendistä. Käytetään puhdasta axiosia, ettei loopata.
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {Authorization: `Bearer ${token}`},
          }
        );

        if (refreshResponse.data.success && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;

          // Tallennetaan uusi token (ensisijaisesti quantix_token)
          localStorage.setItem('quantix_token', newToken);
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem('token', newToken);

          // Päivitetään alkuperäiseen pyyntöön uusi token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Yritetään alkuperäistä pyyntöä uudelleen
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Jos myös refresh epäonnistuu, siivotaan jäljet ja ohjataan ulos
        console.error(
          'Auto-refresh epäonnistui, kirjaudutaan ulos.',
          refreshError
        );
        localStorage.removeItem('quantix_user');
        localStorage.removeItem('quantix_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');

        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

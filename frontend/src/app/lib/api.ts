/**
 * @fileoverview API Client.
 * Configures a global Axios instance with request/response interceptors
 * for automatic JWT attachment and token refreshing.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

/**
 * Helper to retrieve the current auth token from local storage.
 */
const getToken = () =>
  localStorage.getItem('quantix_token') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token');

// (REQUEST INTERCEPTOR) Attach token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// (RESPONSE INTERCEPTOR) Catch 401 errors and attempt token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = getToken();

        // Use a raw axios instance to prevent infinite interceptor loops
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {headers: {Authorization: `Bearer ${token}`}}
        );

        if (refreshResponse.data.success && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;

          // Save new token
          localStorage.setItem('quantix_token', newToken);
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem('token', newToken);

          // Update the original request's header and retry it
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If auto-refresh fails, clean up and redirect to login
        console.error('Auto-refresh failed, logging out.', refreshError);
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

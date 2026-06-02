/**
 * Axios API Service Client
 * Configured with base URL, headers, and request/response interceptors.
 * Seamlessly handles JWT token insertion and automated refresh token rotation.
 */
import axios from 'axios';
import { API_URL, STORAGE_KEYS } from '../utils/constants';

// Create a custom Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HTTP-only cookies (refresh token) automatically
});

// Flag to track token refreshing state
let isRefreshing = false;
// Queue to hold failed requests while token is refreshing
let failedQueue = [];

/**
 * Process queued requests.
 * @param {Error|null} error
 * @param {string|null} token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Request Interceptor ──────────────────────────────────
// Automatically injects the JWT access token into the headers of every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor ─────────────────────────────────
// Catches token expiration (401 errors) and runs silent token rotation
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          // Trigger silent refresh token exchange
          // Uses cookie-based rotation (or fallback body)
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const { accessToken } = response.data.data;

          // Update local token
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

          // Update default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          resolve(api(originalRequest));
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          // Clear credentials and force logout if refresh token fails
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          
          // Dispatch custom event to let contexts hook logout triggers
          window.dispatchEvent(new Event('auth-logout'));

          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;

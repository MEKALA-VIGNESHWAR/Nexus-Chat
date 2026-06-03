/**
 * Axios API Service Client
 * Configured with base URL, headers, and request/response interceptors.
 * Seamlessly handles JWT token insertion and automated refresh token rotation.
 */
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URL, STORAGE_KEYS } from './constants';

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}

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
let failedQueue: FailedQueueItem[] = [];

/**
 * Process queued requests.
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Request Interceptor ──────────────────────────────────
// Automatically injects the JWT access token into the headers of every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor ─────────────────────────────────
// Catches token expiration (401 errors) and runs silent token rotation
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if error is 401 Unauthorized and has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
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

      return new Promise<AxiosResponse>(async (resolve, reject) => {
        try {
          // Trigger silent refresh token exchange
          // Uses cookie-based rotation (or fallback body)
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const { accessToken } = response.data.data;

          if (typeof window !== 'undefined') {
            // Update local token
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            // Dispatch custom event to notify auth context
            window.dispatchEvent(new CustomEvent('auth-token-refresh', { detail: accessToken }));
          }

          // Update default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          resolve(api(originalRequest));
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          
          if (typeof window !== 'undefined') {
            // Clear credentials and force logout if refresh token fails
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            // Dispatch custom event to let contexts hook logout triggers
            window.dispatchEvent(new Event('auth-logout'));
          }

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

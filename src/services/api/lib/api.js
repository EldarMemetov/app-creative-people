import axios from 'axios';
import { useAuth } from '@/services/store/useAuth';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const auth = useAuth.getState();

      if (auth?.refreshingPromise) {
        try {
          await auth.refreshingPromise;
        } catch (e) {}
      }

      const token = useAuth.getState().accessToken;
      config.headers = config.headers || {};

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        if (config.headers.Authorization) delete config.headers.Authorization;
      }
    } catch (e) {
      console.debug('[api.request] interceptor error', e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error?.config;
    if (!originalRequest) return Promise.reject(error);

    try {
      const base =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost';
      const pathname = new URL(originalRequest.url, base).pathname;
      const skip = ['/auth/login', '/auth/register', '/auth/refresh'];
      if (skip.includes(pathname)) {
        return Promise.reject(error);
      }
    } catch (e) {}

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const auth = useAuth.getState();

      try {
        const token = await auth.refresh();

        if (!token) {
          try {
            await auth.logout();
          } catch (e) {}
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        api.defaults.headers = api.defaults.headers || {};
        api.defaults.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (e) {
        try {
          await auth.logout();
        } catch (er) {}
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

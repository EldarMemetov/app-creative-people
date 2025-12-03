// import axios from 'axios';
// import { useAuth } from '../../store/useAuth.js';

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true,
// });

// api.interceptors.request.use(async (config) => {
//   const authStore = useAuth.getState();

//   if (authStore.accessToken) {
//     if (authStore.refreshingPromise) {
//       await authStore.refreshingPromise;
//     }

//     if (authStore.shouldRefresh && authStore.shouldRefresh()) {
//       authStore.refreshingPromise = authStore.refresh();
//       await authStore.refreshingPromise;
//       authStore.refreshingPromise = null;
//     }

//     config.headers.Authorization = `Bearer ${authStore.accessToken}`;
//   }

//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     const skipUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
//     if (skipUrls.includes(originalRequest.url)) {
//       return Promise.reject(error);
//     }

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const authStore = useAuth.getState();

//       try {
//         const newToken = await authStore.refresh();

//         if (newToken) {
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           return api(originalRequest);
//         } else {
//           console.warn('Refresh failed, keeping user logged in temporarily');
//           return Promise.reject(error);
//         }
//       } catch (refreshError) {
//         console.warn(
//           'Refresh threw an error, keeping user logged in temporarily',
//           refreshError
//         );
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

import axios from 'axios';
import { useAuth } from '../../store/useAuth.js';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const auth = useAuth.getState();

  if (!auth.accessToken) return config;

  if (auth.refreshingPromise) {
    try {
      await auth.refreshingPromise;
    } catch (e) {}
  }

  if (auth.shouldRefresh && auth.shouldRefresh()) {
    if (!auth.refreshingPromise) {
      auth.refreshingPromise = auth.refresh();
    }
    try {
      await auth.refreshingPromise;
    } catch (e) {}
  }

  const token = useAuth.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const original = error?.config;
    if (!original || !error.response) return Promise.reject(error);

    const skipPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
    const originalUrl = original.url || '';
    if (skipPaths.some((p) => originalUrl.endsWith(p))) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;
      const auth = useAuth.getState();

      if (auth.refreshingPromise) {
        try {
          await auth.refreshingPromise;
        } catch (e) {}
      } else {
        auth.refreshingPromise = auth.refresh();
        try {
          await auth.refreshingPromise;
        } catch (e) {}
      }

      const fresh = useAuth.getState().accessToken;
      if (fresh) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${fresh}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

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
  const authStore = useAuth.getState();

  if (authStore.accessToken) {
    if (authStore.refreshingPromise) {
      await authStore.refreshingPromise;
    }

    if (authStore.shouldRefresh && authStore.shouldRefresh()) {
      authStore.refreshingPromise = authStore.refresh();
      await authStore.refreshingPromise;
      authStore.refreshingPromise = null;
    }

    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    const skipUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (skipUrls.some((url) => originalRequest.url.endsWith(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authStore = useAuth.getState();

      try {
        const newToken = await authStore.refresh();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          console.warn('Refresh failed, user will be logged out');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.warn('Refresh threw an error', refreshError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

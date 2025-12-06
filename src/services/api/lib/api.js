// import axios from 'axios';

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true,
// });

// let refreshPromise = null;
// let waitingQueue = [];

// const pushToWaiting = () =>
//   new Promise((resolve, reject) => {
//     const item = { resolve, reject };
//     waitingQueue.push(item);
//   });

// const flushWaiting = (err, token = null) => {
//   waitingQueue.forEach((it) => {
//     if (err) it.reject(err);
//     else it.resolve(token);
//   });
//   waitingQueue = [];
// };

// const getAuthState = async () => {
//   try {
//     const mod = await import('../../store/useAuth.js');
//     return mod.useAuth.getState();
//   } catch (e) {
//     return { accessToken: null, refreshingPromise: null, refresh: null };
//   }
// };

// api.interceptors.request.use(async (config) => {
//   const authStore = await getAuthState();

//   if (authStore?.refreshingPromise) {
//     try {
//       await authStore.refreshingPromise;
//     } catch (e) {}
//   }

//   const token = authStore?.accessToken;
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// api.interceptors.response.use(
//   (resp) => resp,
//   async (error) => {
//     const original = error.config;
//     if (!original) return Promise.reject(error);

//     const pathname = (() => {
//       try {
//         if (!original.url) return original.url;
//         if (original.url.startsWith('http'))
//           return new URL(original.url).pathname;
//         return original.url;
//       } catch {
//         return original.url;
//       }
//     })();

//     const skip = ['/auth/login', '/auth/register', '/auth/refresh'];
//     if (skip.includes(pathname)) return Promise.reject(error);

//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true;

//       if (!refreshPromise) {
//         refreshPromise = (async () => {
//           try {
//             const authStore = await getAuthState();
//             if (!authStore?.refresh)
//               throw new Error('no refresh function available');
//             const token = await authStore.refresh();
//             refreshPromise = null;
//             flushWaiting(null, token);
//             return token;
//           } catch (err) {
//             refreshPromise = null;
//             flushWaiting(err, null);
//             throw err;
//           }
//         })();
//       }

//       try {
//         await pushToWaiting();
//         const authStore = await getAuthState();
//         const latestToken = authStore?.accessToken;
//         if (latestToken) {
//           original.headers = original.headers || {};
//           original.headers.Authorization = `Bearer ${latestToken}`;
//         }
//         return api(original);
//       } catch (e) {
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
// src/services/api/lib/api.js
// import axios from 'axios';
// import { useAuth } from '@/services/store/useAuth';

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true,
// });

// let isRefreshing = false;
// let refreshQueue = [];

// const pushToQueue = (cb) => {
//   refreshQueue.push(cb);
// };

// const processQueue = (err, token = null) => {
//   refreshQueue.forEach((cb) => cb(err, token));
//   refreshQueue = [];
// };

// api.interceptors.request.use(
//   async (config) => {
//     try {
//       console.debug(
//         '[api.request] using token:',
//         useAuth.getState().accessToken
//       );
//       const auth = useAuth.getState();

//       if (auth.refreshingPromise) {
//         try {
//           await auth.refreshingPromise;
//         } catch (e) {}
//       }

//       if (typeof auth.shouldRefresh === 'function' && auth.shouldRefresh()) {
//         if (!isRefreshing) {
//           isRefreshing = true;
//           try {
//             const newData = await auth.refresh();

//             if (newData?.token) {
//               api.defaults.headers = api.defaults.headers || {};
//               api.defaults.headers.Authorization = `Bearer ${newData.token}`;
//             }
//             isRefreshing = false;
//             processQueue(null, useAuth.getState().accessToken);
//           } catch (e) {
//             isRefreshing = false;
//             processQueue(e, null);
//           }
//         } else {
//           await new Promise((resolve, reject) => {
//             pushToQueue((err) => {
//               if (err) reject(err);
//               else resolve();
//             });
//           });
//         }
//       }

//       const latest = useAuth.getState().accessToken;
//       if (latest) {
//         config.headers = config.headers || {};
//         config.headers.Authorization = `Bearer ${latest}`;
//       }
//     } catch (e) {}

//     return config;
//   },
//   (err) => Promise.reject(err)
// );

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;
//     if (!originalRequest) return Promise.reject(error);

//     console.debug(
//       '[api.response] 401 for',
//       originalRequest.url,
//       'starting refresh'
//     );

//     try {
//       const urlPath = new URL(
//         originalRequest.url,
//         typeof window !== 'undefined' ? window.location.origin : ''
//       ).pathname;
//       const skip = ['/auth/login', '/auth/register', '/auth/refresh'];
//       if (skip.includes(urlPath)) {
//         return Promise.reject(error);
//       }
//     } catch (e) {}

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const auth = useAuth.getState();

//       if (isRefreshing) {
//         try {
//           const tokenFromQueue = await new Promise((resolve, reject) => {
//             pushToQueue((err, token) => {
//               if (err) reject(err);
//               else resolve(token);
//             });
//           });

//           const tokenAfter = tokenFromQueue || useAuth.getState().accessToken;
//           if (tokenAfter) {
//             originalRequest.headers = originalRequest.headers || {};
//             originalRequest.headers.Authorization = `Bearer ${tokenAfter}`;
//           }

//           return api(originalRequest);
//         } catch (e) {
//           try {
//             await auth.logout();
//           } catch {}
//           return Promise.reject(error);
//         }
//       }

//       isRefreshing = true;
//       try {
//         const newData = await auth.refresh();
//         isRefreshing = false;

//         if (!newData?.token) {
//           processQueue(new Error('refresh_failed'), null);
//           try {
//             await auth.logout();
//           } catch {}
//           return Promise.reject(error);
//         }

//         api.defaults.headers = api.defaults.headers || {};
//         api.defaults.headers.Authorization = `Bearer ${newData.token}`;

//         processQueue(null, newData.token);

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${newData.token}`;

//         return api(originalRequest);
//       } catch (e) {
//         isRefreshing = false;
//         processQueue(e, null);
//         try {
//           await auth.logout();
//         } catch {}
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// src/services/api/lib/api.js
// src/services/api/lib/api.js
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
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } else if (config.headers) {
        delete config.headers.Authorization;
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

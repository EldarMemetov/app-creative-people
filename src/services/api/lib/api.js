// import axios from 'axios';
// import { useAuth } from '@/services/store/useAuth';

// export const api = axios.create({
//   baseURL: '/api',
//   withCredentials: true,
// });

// api.interceptors.request.use(
//   async (config) => {
//     try {
//       const auth = useAuth.getState();

//       if (auth?.refreshingPromise) {
//         try {
//           await auth.refreshingPromise;
//         } catch (e) {}
//       }

//       const token = useAuth.getState().accessToken;
//       if (token) {
//         config.headers = config.headers || {};
//         config.headers.Authorization = `Bearer ${token}`;
//       } else if (config.headers) {
//         delete config.headers.Authorization;
//       }
//     } catch (e) {
//       console.debug('[api.request] interceptor error', e);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (resp) => resp,
//   async (error) => {
//     const originalRequest = error?.config;
//     if (!originalRequest) return Promise.reject(error);

//     try {
//       const base =
//         typeof window !== 'undefined'
//           ? window.location.origin
//           : 'http://localhost';
//       const pathname = new URL(originalRequest.url, base).pathname;

//       const skip = ['/auth/login', '/auth/register', '/auth/refresh'];
//       if (skip.includes(pathname)) {
//         return Promise.reject(error);
//       }
//     } catch (e) {}

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const auth = useAuth.getState();

//       try {
//         const token = await auth.refresh();

//         if (!token) {
//           try {
//             await auth.logout();
//           } catch (e) {}
//           return Promise.reject(error);
//         }

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${token}`;

//         return api(originalRequest);
//       } catch (e) {
//         try {
//           await auth.logout();
//         } catch (er) {}
//         return Promise.reject(e);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
// api.js
import axios from 'axios';
import { useAuth } from '@/services/store/useAuth';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let isRefreshing = false;
let queue = [];

const pushToQueue = (cb) => queue.push(cb);
const processQueue = (err, token = null) => {
  queue.forEach((cb) => cb(err, token));
  queue = [];
};

api.interceptors.request.use(
  async (config) => {
    try {
      const authState = useAuth.getState();

      if (authState?.refreshingPromise) {
        try {
          await authState.refreshingPromise;
        } catch {}
      }

      const token = useAuth.getState().accessToken;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } else if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    } catch (e) {}
    return config;
  },
  (err) => Promise.reject(err)
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

      if (isRefreshing) {
        try {
          const tokenFromQueue = await new Promise((resolve, reject) => {
            pushToQueue((err, token) => {
              if (err) reject(err);
              else resolve(token);
            });
          });

          const tokenAfter = tokenFromQueue || useAuth.getState().accessToken;
          if (tokenAfter) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${tokenAfter}`;
          }
          return api(originalRequest);
        } catch (e) {
          try {
            await auth.logout();
          } catch {}
          return Promise.reject(error);
        }
      }

      isRefreshing = true;
      try {
        const token = await auth.refresh();
        isRefreshing = false;

        if (!token) {
          processQueue(new Error('refresh_failed'), null);
          try {
            await auth.logout();
          } catch {}
          return Promise.reject(error);
        }

        api.defaults.headers = api.defaults.headers || {};
        api.defaults.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (e) {
        isRefreshing = false;
        processQueue(e, null);
        try {
          await auth.logout();
        } catch {}
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

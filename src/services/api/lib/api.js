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
// import axios from 'axios';
// import { useAuth } from '../../store/useAuth.js';

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true,
// });

// let isRefreshing = false;
// let refreshQueue = [];

// const QUEUE_WAIT_TIMEOUT = 10_000;

// const pushToQueue = () =>
//   new Promise((resolve, reject) => {
//     const item = { resolve, reject };

//     item.timer = setTimeout(() => {
//       refreshQueue = refreshQueue.filter((it) => it !== item);
//       reject(new Error('refresh queue timeout'));
//     }, QUEUE_WAIT_TIMEOUT);
//     refreshQueue.push(item);
//   });

// const flushQueue = (err, token = null) => {
//   refreshQueue.forEach((it) => {
//     clearTimeout(it.timer);
//     if (err) it.reject(err);
//     else it.resolve(token);
//   });
//   refreshQueue = [];
// };

// const getPathname = (url) => {
//   try {
//     if (!url) return url;
//     if (url.startsWith('http')) return new URL(url).pathname;
//     return url;
//   } catch (e) {
//     return url;
//   }
// };

// api.interceptors.request.use(
//   async (config) => {
//     const authStore = useAuth.getState();

//     if (authStore.refreshingPromise) {
//       try {
//         await Promise.race([
//           authStore.refreshingPromise,
//           new Promise((_, rej) =>
//             setTimeout(
//               () => rej(new Error('store refresh timeout')),
//               QUEUE_WAIT_TIMEOUT
//             )
//           ),
//         ]);
//       } catch (e) {
//         console.debug(
//           '[api] store.refreshingPromise wait failed:',
//           e?.message || e
//         );
//       }
//     }

//     if (authStore.accessToken) {
//       if (authStore.shouldRefresh && authStore.shouldRefresh()) {
//         if (!isRefreshing) {
//           isRefreshing = true;
//           authStore.refreshingPromise = authStore.refresh();
//           try {
//             const newToken = await Promise.race([
//               authStore.refreshingPromise,
//               new Promise((_, rej) =>
//                 setTimeout(
//                   () => rej(new Error('refresh timeout')),
//                   QUEUE_WAIT_TIMEOUT
//                 )
//               ),
//             ]);

//             authStore.refreshingPromise = null;
//             isRefreshing = false;
//             flushQueue(null, newToken);
//           } catch (err) {
//             authStore.refreshingPromise = null;
//             isRefreshing = false;
//             flushQueue(err, null);
//             console.warn('[api] refresh failed in request interceptor:', err);
//           }
//         } else {
//           try {
//             await pushToQueue();
//           } catch (e) {
//             console.debug('[api] waiting in queue failed:', e?.message || e);
//           }
//         }
//       }

//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${authStore.accessToken}`;
//     }

//     return config;
//   },
//   (err) => Promise.reject(err)
// );

// api.interceptors.response.use(
//   (resp) => resp,
//   async (error) => {
//     const originalRequest = error.config;
//     if (!originalRequest) return Promise.reject(error);

//     const skipPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
//     const requestPath = getPathname(originalRequest.url);

//     if (skipPaths.includes(requestPath)) {
//       return Promise.reject(error);
//     }

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const authStore = useAuth.getState();

//       if (isRefreshing || authStore.refreshingPromise) {
//         try {
//           const token = await Promise.race([
//             pushToQueue(),
//             new Promise((_, rej) =>
//               setTimeout(
//                 () => rej(new Error('queue wait timeout')),
//                 QUEUE_WAIT_TIMEOUT
//               )
//             ),
//           ]);

//           const latestToken = useAuth.getState().accessToken;
//           originalRequest.headers = originalRequest.headers || {};
//           if (latestToken)
//             originalRequest.headers.Authorization = `Bearer ${latestToken}`;
//           return api(originalRequest);
//         } catch (e) {
//           console.debug(
//             '[api] waiting for concurrent refresh failed:',
//             e?.message || e
//           );
//           return Promise.reject(error);
//         }
//       }

//       isRefreshing = true;
//       authStore.refreshingPromise = authStore.refresh();

//       try {
//         const newToken = await Promise.race([
//           authStore.refreshingPromise,
//           new Promise((_, rej) =>
//             setTimeout(
//               () => rej(new Error('refresh timeout')),
//               QUEUE_WAIT_TIMEOUT
//             )
//           ),
//         ]);
//         authStore.refreshingPromise = null;
//         isRefreshing = false;
//         flushQueue(null, newToken);

//         if (newToken) {
//           api.defaults.headers.Authorization = `Bearer ${newToken}`;
//           originalRequest.headers = originalRequest.headers || {};
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           return api(originalRequest);
//         } else {
//           return Promise.reject(error);
//         }
//       } catch (refreshErr) {
//         authStore.refreshingPromise = null;
//         isRefreshing = false;
//         flushQueue(refreshErr, null);
//         console.warn(
//           '[api] refresh failed in response interceptor:',
//           refreshErr
//         );
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
} from '../api/auth/auth.js';
import { api } from '../api/lib/api.js';

const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const REFRESH_BUFFER_MS = 60 * 1000;

export const useAuth = create(
  persist(
    (set, get) => ({
      accessToken: null,
      accessTokenObtainedAt: null,
      user: null,
      loading: false,
      isAuthChecked: false,
      refreshTimeout: null,

      refreshingPromise: null,

      setUser: (user) => set({ user }),

      shouldRefresh: () => {
        const token = get().accessToken;
        const obtainedAt = get().accessTokenObtainedAt;
        if (!token || !obtainedAt) return false;
        const expiry = obtainedAt + ACCESS_TOKEN_LIFETIME_MS;
        const msLeft = expiry - Date.now();

        return msLeft < 2 * 60 * 1000;
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const token = await loginUser({ email, password });
          const now = Date.now();
          set({
            accessToken: token,
            accessTokenObtainedAt: now,
            loading: false,
          });

          api.defaults.headers.Authorization = `Bearer ${token}`;

          await get().fetchUser();
          get().scheduleRefresh();
          return token;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      fetchUser: async () => {
        if (!get().accessToken) {
          set({ user: null, isAuthChecked: true });
          return null;
        }
        try {
          const user = await getProfile();
          set({ user, isAuthChecked: true });
          return user;
        } catch (err) {
          set({
            accessToken: null,
            accessTokenObtainedAt: null,
            user: null,
            isAuthChecked: true,
          });
          return null;
        }
      },

      refresh: async () => {
        if (get().refreshingPromise) {
          return get().refreshingPromise;
        }

        const promise = (async () => {
          try {
            let token = await refreshAccessToken();

            if (!token) {
              console.warn('Refresh returned null, retrying in 3s...');
              await new Promise((res) => setTimeout(res, 3000));
              token = await refreshAccessToken();
            }

            if (token) {
              const now = Date.now();
              set({
                accessToken: token,
                accessTokenObtainedAt: now,
              });
              api.defaults.headers.Authorization = `Bearer ${token}`;

              await get().fetchUser();
              get().scheduleRefresh();

              return token;
            }

            set({
              accessToken: null,
              accessTokenObtainedAt: null,
              user: null,
              isAuthChecked: true,
            });
            return null;
          } catch (err) {
            set({
              accessToken: null,
              accessTokenObtainedAt: null,
              user: null,
              isAuthChecked: true,
            });
            return null;
          }
        })();

        set({ refreshingPromise: promise });
        promise.finally(() => {
          const cur = get().refreshingPromise;
          if (cur === promise) {
            set({ refreshingPromise: null });
          }
        });

        return promise;
      },

      scheduleRefresh: () => {
        if (get().refreshTimeout) clearTimeout(get().refreshTimeout);

        const obtainedAt = get().accessTokenObtainedAt;
        if (!obtainedAt) return;

        const expiry = obtainedAt + ACCESS_TOKEN_LIFETIME_MS;
        const delay = Math.max(expiry - Date.now() - REFRESH_BUFFER_MS, 0);

        const timeout = setTimeout(async () => {
          const token = await get().refresh();
          if (!token) {
            console.warn('Automatic refresh failed, scheduling retry');
            get().scheduleRefreshRetry();
          }
        }, delay);

        set({ refreshTimeout: timeout });
      },

      scheduleRefreshRetry: () => {
        const timeout = setTimeout(async () => {
          const token = await get().refresh();
          if (!token) {
            console.warn('Retry refresh failed, scheduling another retry');
            get().scheduleRefreshRetry();
          }
        }, 30_000);
        set({ refreshTimeout: timeout });
      },

      stopRefresh: () => {
        if (get().refreshTimeout) clearTimeout(get().refreshTimeout);
        set({ refreshTimeout: null });
      },

      logout: async () => {
        try {
          await logoutUser();
        } catch (err) {
          console.warn('Logout failed', err);
        } finally {
          get().stopRefresh();
          set({
            accessToken: null,
            accessTokenObtainedAt: null,
            user: null,
            isAuthChecked: true,
          });
          delete api.defaults.headers.Authorization;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        accessTokenObtainedAt: state.accessTokenObtainedAt,
        user: state.user,
      }),
    }
  )
);

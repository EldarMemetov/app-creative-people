// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import {
//   loginUser,
//   refreshAccessToken,
//   logoutUser,
//   getProfile,
// } from '../api/auth/auth.js';
// import { api } from '../api/lib/api.js';

// export const useAuth = create(
//   persist(
//     (set, get) => ({
//       accessToken: null,
//       user: null,
//       loading: false,
//       isAuthChecked: false,
//       refreshTimeout: null,
//       refreshingPromise: null,

//       setUser: (user) => set({ user }),

//       login: async (email, password) => {
//         set({ loading: true });
//         try {
//           const token = await loginUser({ email, password });
//           set({ accessToken: token, loading: false });
//           await get().fetchUser();
//           get().scheduleRefresh();
//           return token;
//         } catch (err) {
//           set({ loading: false });
//           throw err;
//         }
//       },

//       fetchUser: async () => {
//         if (!get().accessToken) {
//           set({ user: null, isAuthChecked: true });
//           return null;
//         }
//         try {
//           const user = await getProfile();
//           set({ user, isAuthChecked: true });
//           return user;
//         } catch (err) {
//           set({ accessToken: null, user: null, isAuthChecked: true });
//           return null;
//         }
//       },

//       refresh: async () => {
//         try {
//           let token = await refreshAccessToken();

//           if (!token) {
//             console.warn('Refresh failed, retrying in 3s...');
//             await new Promise((res) => setTimeout(res, 3000));
//             token = await refreshAccessToken();
//           }

//           if (token) {
//             set({ accessToken: token });
//             api.defaults.headers.Authorization = `Bearer ${token}`;
//             await get().fetchUser();
//             get().scheduleRefresh();
//             return token;
//           }

//           set({ accessToken: null, user: null, isAuthChecked: true });
//           return null;
//         } catch (err) {
//           set({ accessToken: null, user: null, isAuthChecked: true });
//           return null;
//         }
//       },

//       scheduleRefresh: () => {
//         if (get().refreshTimeout) clearTimeout(get().refreshTimeout);

//         const cookies = document.cookie.split('; ').reduce((acc, curr) => {
//           const [k, v] = curr.split('=');
//           acc[k] = decodeURIComponent(v);
//           return acc;
//         }, {});

//         const refreshTokenExpiry = cookies.refreshTokenValidUntil
//           ? new Date(cookies.refreshTokenValidUntil).getTime()
//           : Date.now() + 15 * 60 * 1000;

//         const delay = Math.max(refreshTokenExpiry - Date.now() - 60_000, 0);

//         const timeout = setTimeout(async () => {
//           const token = await get().refresh();
//           if (!token) {
//             console.warn(
//               'Automatic refresh failed, user stays logged in until next request'
//             );
//             get().scheduleRefreshRetry();
//           }
//         }, delay);

//         set({ refreshTimeout: timeout });
//       },

//       scheduleRefreshRetry: () => {
//         const timeout = setTimeout(async () => {
//           const token = await get().refresh();
//           if (!token) {
//             console.warn(
//               'Retry refresh failed, user still logged in temporarily'
//             );
//             get().scheduleRefreshRetry();
//           }
//         }, 30_000);
//         set({ refreshTimeout: timeout });
//       },

//       stopRefresh: () => {
//         if (get().refreshTimeout) clearTimeout(get().refreshTimeout);
//         set({ refreshTimeout: null });
//       },

//       logout: async () => {
//         try {
//           await logoutUser();
//         } catch (err) {
//           console.warn('Logout failed', err);
//         } finally {
//           get().stopRefresh();
//           set({ accessToken: null, user: null, isAuthChecked: true });
//         }
//       },
//     }),
//     {
//       name: 'auth-storage',
//       partialize: (state) => ({
//         accessToken: state.accessToken,
//         user: state.user,
//       }),
//     }
//   )
// );
import axios from 'axios';
import { useAuth } from '../../store/useAuth.js';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const QUEUE_WAIT_TIMEOUT = 10_000;
const REFRESH_CALL_TIMEOUT = 10_000;

const pushToQueue = () =>
  new Promise((resolve, reject) => {
    const item = { resolve, reject };
    item.timer = setTimeout(() => {
      refreshQueue = refreshQueue.filter((it) => it !== item);
      reject(new Error('refresh queue timeout'));
    }, QUEUE_WAIT_TIMEOUT);
    refreshQueue.push(item);
  });

const flushQueue = (err, token = null) => {
  refreshQueue.forEach((it) => {
    clearTimeout(it.timer);
    if (err) it.reject(err);
    else it.resolve(token);
  });
  refreshQueue = [];
};

const getPathname = (url) => {
  try {
    if (!url) return url;
    if (url.startsWith('http')) return new URL(url).pathname;
    return url;
  } catch (e) {
    return url;
  }
};

api.interceptors.request.use(
  async (config) => {
    const authStore = useAuth.getState();

    if (authStore.refreshingPromise) {
      try {
        await Promise.race([
          authStore.refreshingPromise,
          new Promise((_, rej) =>
            setTimeout(
              () => rej(new Error('store refresh timeout')),
              QUEUE_WAIT_TIMEOUT
            )
          ),
        ]);
      } catch (e) {
        console.debug(
          '[api] store.refreshingPromise wait failed:',
          e?.message || e
        );
      }
    }

    if (authStore.accessToken) {
      if (authStore.shouldRefresh && authStore.shouldRefresh()) {
        if (!isRefreshing) {
          isRefreshing = true;
          authStore.refreshingPromise = authStore.refresh();
          try {
            const newToken = await Promise.race([
              authStore.refreshingPromise,
              new Promise((_, rej) =>
                setTimeout(
                  () => rej(new Error('refresh timeout')),
                  REFRESH_CALL_TIMEOUT
                )
              ),
            ]);
            authStore.refreshingPromise = null;
            isRefreshing = false;
            flushQueue(null, newToken);
          } catch (err) {
            authStore.refreshingPromise = null;
            isRefreshing = false;
            flushQueue(err, null);
            console.warn('[api] refresh failed in request interceptor:', err);
          }
        } else {
          try {
            await pushToQueue();
          } catch (e) {
            console.debug(
              '[api] waiting in refresh queue failed:',
              e?.message || e
            );
          }
        }
      }

      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const skipPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
    const requestPath = getPathname(originalRequest.url);
    if (skipPaths.includes(requestPath)) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authStore = useAuth.getState();

      if (isRefreshing || authStore.refreshingPromise) {
        try {
          await pushToQueue();
          const latestToken = useAuth.getState().accessToken;
          originalRequest.headers = originalRequest.headers || {};
          if (latestToken)
            originalRequest.headers.Authorization = `Bearer ${latestToken}`;
          return api(originalRequest);
        } catch (e) {
          console.debug(
            '[api] wait for concurrent refresh failed:',
            e?.message || e
          );
          return Promise.reject(error);
        }
      }

      isRefreshing = true;
      authStore.refreshingPromise = authStore.refresh();

      try {
        const newToken = await Promise.race([
          authStore.refreshingPromise,
          new Promise((_, rej) =>
            setTimeout(
              () => rej(new Error('refresh timeout')),
              REFRESH_CALL_TIMEOUT
            )
          ),
        ]);
        authStore.refreshingPromise = null;
        isRefreshing = false;
        flushQueue(null, newToken);

        if (newToken) {
          api.defaults.headers.Authorization = `Bearer ${newToken}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        authStore.refreshingPromise = null;
        isRefreshing = false;
        flushQueue(refreshErr, null);
        console.warn(
          '[api] refresh failed in response interceptor:',
          refreshErr
        );
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

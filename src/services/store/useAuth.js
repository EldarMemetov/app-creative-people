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
              console.warn('Refresh failed, retrying in 3s...');
              await new Promise((res) => setTimeout(res, 3000));
              token = await refreshAccessToken();
            }

            if (token) {
              const now = Date.now();
              set({ accessToken: token, accessTokenObtainedAt: now });
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
          } finally {
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
        if (!obtainedAt) {
          return;
        }

        const expiry = obtainedAt + ACCESS_TOKEN_LIFETIME_MS;
        // запускаем рефреш за REFRESH_BUFFER_MS до expiry
        const delay = Math.max(expiry - Date.now() - REFRESH_BUFFER_MS, 0);

        const timeout = setTimeout(async () => {
          const token = await get().refresh();
          if (!token) {
            console.warn(
              'Automatic refresh failed, will retry via scheduleRefreshRetry'
            );
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

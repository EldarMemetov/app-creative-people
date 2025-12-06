// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import {
//   loginUser,
//   refreshAccessToken,
//   logoutUser,
//   getProfile,
// } from '../api/auth/auth.js';
// import { api } from '../api/lib/api.js';

// const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
// const REFRESH_BUFFER_MS = 60 * 1000;

// export const useAuth = create(
//   persist(
//     (set, get) => ({
//       accessToken: null,
//       accessTokenObtainedAt: null,
//       user: null,
//       loading: false,
//       isAuthChecked: false,
//       refreshTimeout: null,
//       refreshingPromise: null,

//       setUser: (user) => set({ user }),

//       shouldRefresh: () => {
//         const token = get().accessToken;
//         const obtainedAt = get().accessTokenObtainedAt;
//         if (!token || !obtainedAt) return false;
//         const expiry = obtainedAt + ACCESS_TOKEN_LIFETIME_MS;
//         const msLeft = expiry - Date.now();

//         return msLeft < 2 * 60 * 1000;
//       },

//       login: async (email, password) => {
//         set({ loading: true });
//         try {
//           const token = await loginUser({ email, password });
//           const now = Date.now();
//           set({
//             accessToken: token,
//             accessTokenObtainedAt: now,
//             loading: false,
//           });

//           api.defaults.headers.Authorization = `Bearer ${token}`;

//           await get().fetchUser();
//           get().scheduleRefresh();
//           return token;
//         } catch (err) {
//           set({ loading: false });
//           throw err;
//         }
//       },

//       initAuth: async () => {
//         const state = get();
//         const token = state.accessToken;
//         const obtainedAt = state.accessTokenObtainedAt;

//         if (!token || !obtainedAt) {
//           set({ isAuthChecked: true });
//           return;
//         }

//         api.defaults.headers.Authorization = `Bearer ${token}`;

//         if (get().shouldRefresh && get().shouldRefresh()) {
//           const newToken = await get().refresh();
//           if (!newToken) {
//             set({
//               accessToken: null,
//               accessTokenObtainedAt: null,
//               user: null,
//               isAuthChecked: true,
//             });
//             return;
//           }
//           api.defaults.headers.Authorization = `Bearer ${newToken}`;
//         }

//         try {
//           await get().fetchUser();
//         } catch (e) {}

//         get().scheduleRefresh();
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
//           set({
//             accessToken: null,
//             accessTokenObtainedAt: null,
//             user: null,
//             isAuthChecked: true,
//           });
//           return null;
//         }
//       },

//       refresh: async () => {
//         if (get().refreshingPromise) {
//           return get().refreshingPromise;
//         }

//         const promise = (async () => {
//           try {
//             let token = await refreshAccessToken();

//             if (!token) {
//               console.warn('Refresh returned null, retrying in 3s...');
//               await new Promise((res) => setTimeout(res, 3000));
//               token = await refreshAccessToken();
//             }

//             if (token) {
//               const now = Date.now();
//               set({
//                 accessToken: token,
//                 accessTokenObtainedAt: now,
//               });
//               api.defaults.headers.Authorization = `Bearer ${token}`;

//               await get().fetchUser();
//               get().scheduleRefresh();

//               return token;
//             }

//             set({
//               accessToken: null,
//               accessTokenObtainedAt: null,
//               user: null,
//               isAuthChecked: true,
//             });
//             return null;
//           } catch (err) {
//             set({
//               accessToken: null,
//               accessTokenObtainedAt: null,
//               user: null,
//               isAuthChecked: true,
//             });
//             return null;
//           }
//         })();

//         set({ refreshingPromise: promise });
//         promise.finally(() => {
//           const cur = get().refreshingPromise;
//           if (cur === promise) {
//             set({ refreshingPromise: null });
//           }
//         });

//         return promise;
//       },

//       scheduleRefresh: () => {
//         if (get().refreshTimeout) clearTimeout(get().refreshTimeout);

//         const obtainedAt = get().accessTokenObtainedAt;
//         if (!obtainedAt) return;

//         const expiry = obtainedAt + ACCESS_TOKEN_LIFETIME_MS;
//         const delay = Math.max(expiry - Date.now() - REFRESH_BUFFER_MS, 0);

//         const timeout = setTimeout(async () => {
//           const token = await get().refresh();
//           if (!token) {
//             console.warn('Automatic refresh failed, scheduling retry');
//             get().scheduleRefreshRetry();
//           }
//         }, delay);

//         set({ refreshTimeout: timeout });
//       },

//       scheduleRefreshRetry: () => {
//         const timeout = setTimeout(async () => {
//           const token = await get().refresh();
//           if (!token) {
//             console.warn('Retry refresh failed, scheduling another retry');
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
//           set({
//             accessToken: null,
//             accessTokenObtainedAt: null,
//             user: null,
//             isAuthChecked: true,
//           });
//           delete api.defaults.headers.Authorization;
//         }
//       },
//     }),
//     {
//       name: 'auth-storage',
//       partialize: (state) => ({
//         accessToken: state.accessToken,
//         accessTokenObtainedAt: state.accessTokenObtainedAt,
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

      initAuth: async () => {
        const state = get();
        const token = state.accessToken;
        const obtainedAt = state.accessTokenObtainedAt;

        if (!token || !obtainedAt) {
          set({ isAuthChecked: true });
          return;
        }

        api.defaults.headers.Authorization = `Bearer ${token}`;

        const expiry = obtainedAt + ACCESS_TOKEN_LIFETIME_MS;
        if (Date.now() >= expiry) {
          const newToken = await get().refresh();
          if (!newToken) {
            set({
              accessToken: null,
              accessTokenObtainedAt: null,
              user: null,
              isAuthChecked: true,
            });
            return;
          }
          api.defaults.headers.Authorization = `Bearer ${newToken}`;
        } else if (get().shouldRefresh && get().shouldRefresh()) {
          const newToken = await get().refresh();
          if (newToken)
            api.defaults.headers.Authorization = `Bearer ${newToken}`;
        }

        try {
          await get().fetchUser();
        } catch (e) {}

        get().scheduleRefresh();
        set({ isAuthChecked: true });
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

            await get().logout();
            return null;
          } catch (err) {
            await get().logout();
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

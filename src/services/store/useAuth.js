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
      isAuthChecked: false,
      refreshTimeout: null,
      refreshingPromise: null,
      loading: false,

      setUser: (user) => set((s) => ({ ...s, user })),

      setAccessToken: (token) =>
        set((s) => {
          if (!token) {
            return { ...s, accessToken: null, accessTokenObtainedAt: null };
          }
          return {
            ...s,
            accessToken: token,
            accessTokenObtainedAt: Date.now(),
          };
        }),

      shouldRefresh: () => {
        const { accessToken, accessTokenObtainedAt } = get();
        if (!accessToken || !accessTokenObtainedAt) return false;
        const expiry = accessTokenObtainedAt + ACCESS_TOKEN_LIFETIME_MS;
        const remaining = expiry - Date.now();
        return remaining < REFRESH_BUFFER_MS;
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

          api.defaults.headers = api.defaults.headers || {};
          api.defaults.headers.Authorization = `Bearer ${token}`;

          await get().fetchUser();
          get().scheduleRefresh();

          return token;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      initAuth: async () => {
        const { accessToken, accessTokenObtainedAt } = get();

        if (!accessToken || !accessTokenObtainedAt) {
          set({ isAuthChecked: true });
          return;
        }

        api.defaults.headers = api.defaults.headers || {};
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;

        if (get().shouldRefresh()) {
          const token = await get().refresh();
          if (!token) {
            set({
              accessToken: null,
              accessTokenObtainedAt: null,
              user: null,
              isAuthChecked: true,
            });
            return;
          }
        }

        try {
          await get().fetchUser();
        } catch (e) {}

        get().scheduleRefresh();
      },

      fetchUser: async () => {
        const token = get().accessToken;
        if (!token) {
          set({ user: null, isAuthChecked: true });
          return null;
        }

        try {
          const user = await getProfile();
          set({ user, isAuthChecked: true });
          return user;
        } catch (error) {
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
              await new Promise((res) => setTimeout(res, 1500));
              token = await refreshAccessToken();
            }

            if (!token) {
              get().stopRefresh();
              set({
                accessToken: null,
                accessTokenObtainedAt: null,
                user: null,
                isAuthChecked: true,
              });
              return null;
            }

            const now = Date.now();
            set({ accessToken: token, accessTokenObtainedAt: now });

            api.defaults.headers = api.defaults.headers || {};
            api.defaults.headers.Authorization = `Bearer ${token}`;

            try {
              const profileRes = await fetch('/api/profile/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (profileRes.ok) {
                const json = await profileRes.json();
                const userObj = json?.data || null;
                if (userObj) {
                  set({ user: userObj, isAuthChecked: true });
                }
              } else {
                if (profileRes.status === 401) {
                  set({ user: null });
                }
              }
            } catch (e) {
              console.warn(
                '[useAuth.refresh] profile fetch (native) failed',
                e
              );
            }

            get().scheduleRefresh();

            return token;
          } catch (error) {
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
          if (get().refreshingPromise === promise) {
            set({ refreshingPromise: null });
          }
        });

        return promise;
      },

      scheduleRefresh: () => {
        const { accessTokenObtainedAt } = get();

        if (get().refreshTimeout) {
          clearTimeout(get().refreshTimeout);
        }

        if (!accessTokenObtainedAt) return;

        const expiry = accessTokenObtainedAt + ACCESS_TOKEN_LIFETIME_MS;
        const delay = Math.max(expiry - Date.now() - REFRESH_BUFFER_MS, 0);

        const timeout = setTimeout(() => {
          get().refresh();
        }, delay);

        set({ refreshTimeout: timeout });
      },

      logout: async () => {
        try {
          await logoutUser();
        } catch (e) {}

        get().stopRefresh();

        set({
          accessToken: null,
          accessTokenObtainedAt: null,
          user: null,
          isAuthChecked: true,
        });

        if (api.defaults && api.defaults.headers) {
          delete api.defaults.headers.Authorization;
        }
      },

      stopRefresh: () => {
        if (get().refreshTimeout) clearTimeout(get().refreshTimeout);
        set({ refreshTimeout: null });
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

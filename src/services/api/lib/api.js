import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let refreshPromise = null;
let waitingQueue = [];

const pushToWaiting = () =>
  new Promise((resolve, reject) => {
    const item = { resolve, reject };
    waitingQueue.push(item);
  });

const flushWaiting = (err, token = null) => {
  waitingQueue.forEach((it) => {
    if (err) it.reject(err);
    else it.resolve(token);
  });
  waitingQueue = [];
};

const getAuthState = async () => {
  try {
    const mod = await import('../../store/useAuth.js');
    return mod.useAuth.getState();
  } catch (e) {
    return { accessToken: null, refreshingPromise: null, refresh: null };
  }
};

api.interceptors.request.use(async (config) => {
  const authStore = await getAuthState();

  if (authStore?.refreshingPromise) {
    try {
      await authStore.refreshingPromise;
    } catch (e) {}
  }

  const token = authStore?.accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);

    const pathname = (() => {
      try {
        if (!original.url) return original.url;
        if (original.url.startsWith('http'))
          return new URL(original.url).pathname;
        return original.url;
      } catch {
        return original.url;
      }
    })();

    const skip = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (skip.includes(pathname)) return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const authStore = await getAuthState();
            if (!authStore?.refresh)
              throw new Error('no refresh function available');
            const token = await authStore.refresh();
            refreshPromise = null;
            flushWaiting(null, token);
            return token;
          } catch (err) {
            refreshPromise = null;
            flushWaiting(err, null);
            throw err;
          }
        })();
      }

      try {
        await pushToWaiting();
        const authStore = await getAuthState();
        const latestToken = authStore?.accessToken;
        if (latestToken) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${latestToken}`;
        }
        return api(original);
      } catch (e) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

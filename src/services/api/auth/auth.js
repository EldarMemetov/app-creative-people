import { api } from '../lib/api.js';
import { handleError } from '@/utils/errorHandler';

export const registerUser = async (data) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const loginUser = async (data) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data.data.accessToken;
  } catch (err) {
    throw handleError(err);
  }
};

export const refreshAccessToken = async (timeoutMs = 10000, retry = true) => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      console.warn('[refresh] fetch failed status', res.status);
      return null;
    }

    const data = await res.json();
    console.debug('[refresh] response body', data);
    return data?.data?.accessToken || null;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[refresh] aborted by timeout');

      if (retry) {
        return refreshAccessToken(timeoutMs, false);
      }
    } else {
      console.warn('[refresh] fetch error', err);
    }
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout', {}, { withCredentials: true });
  } catch (err) {
    throw handleError(err);
  }
};

export const getProfile = async () => {
  try {
    const res = await api.get('/profile/me', { withCredentials: true });
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};
export const requestResetEmail = async (email) => {
  try {
    const res = await api.post('/auth/send-reset-email', { email });
    return res.data;
  } catch (err) {
    console.error('[requestResetEmail] err:', err.response?.data || err);
    throw err.response?.data || err;
  }
};

export const resetPassword = async ({ token, password }) => {
  try {
    const res = await api.post('/auth/reset-pwd', { token, password });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

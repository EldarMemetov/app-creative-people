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

export const refreshAccessToken = async () => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      console.warn('[refresh] fetch failed status', res.status);
      return null;
    }

    const data = await res.json();

    console.debug('[refresh] response body', data);
    return data?.data?.accessToken || null;
  } catch (err) {
    console.warn('[refresh] fetch error', err);
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

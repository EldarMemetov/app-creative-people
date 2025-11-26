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
    const res = await api.post('/auth/refresh', {}, { withCredentials: true });
    return res.data?.data?.accessToken || null;
  } catch (err) {
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    throw handleError(err);
  }
};

export const getProfile = async () => {
  try {
    const res = await api.get('/profile/me');
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

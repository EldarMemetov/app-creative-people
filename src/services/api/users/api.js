import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/people/all');
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const { data } = await api.get(`/people/${id}`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};
export const likeUser = async (userId) => {
  try {
    const { data } = await api.post(`/people/${userId}/like`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const unlikeUser = async (userId) => {
  try {
    const { data } = await api.delete(`/people/${userId}/like`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getLikeStatus = async (userId) => {
  try {
    const { data } = await api.get(`/people/${userId}/like`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

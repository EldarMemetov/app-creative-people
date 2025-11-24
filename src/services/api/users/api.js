import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

// Получить всех пользователей

export const getAllUsers = async () => {
  try {
    const response = await api.get('/profile/all');
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Получить одного пользователя по id
export const getUserById = async (id) => {
  try {
    const { data } = await api.get(`/profile/${id}`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Получить свой профиль
export const getMyProfile = async () => {
  try {
    const { data } = await api.get('/profile');
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

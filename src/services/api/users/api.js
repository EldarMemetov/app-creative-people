import axios from 'axios';
import { handleError } from '@/utils/errorHandler';
const api = axios.create({
  baseURL: 'https://app-server-o38y.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получить всех пользователей

export const getAllUsers = async () => {
  try {
    const response = await axios.get(
      'https://app-server-o38y.onrender.com/profile/all'
    );
    return response.data.data; // массив пользователей
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

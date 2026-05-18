import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const sendContactMessage = async (payload) => {
  try {
    const { data } = await api.post('/contact', payload);
    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

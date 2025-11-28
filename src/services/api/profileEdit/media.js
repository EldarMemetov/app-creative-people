import { api } from '../lib/api';

export const uploadPhoto = async (formData) => {
  const { data } = await api.post('/profile/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deletePhoto = async () => {
  const { data } = await api.delete('/profile/photo');
  return data.data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.patch('/profile', payload);
  return data.data;
};

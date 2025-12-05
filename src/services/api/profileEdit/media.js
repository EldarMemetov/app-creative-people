import { api } from '../lib/api';

export const uploadPhoto = async (formData, onProgress) => {
  try {
    const { data } = await api.post('/profile/upload-photo', formData, {
      withCredentials: true,
      onUploadProgress: (e) =>
        onProgress?.(Math.round((e.loaded * 100) / e.total)),
    });
    return data.data;
  } catch (err) {
    console.error('uploadPhoto error', err);
    throw err;
  }
};

export const deletePhoto = async () => {
  try {
    const { data } = await api.delete('/profile/photo', {
      withCredentials: true,
    });
    return data.data;
  } catch (err) {
    console.error('deletePhoto error', err);
    throw err;
  }
};

export const updateProfile = async (payload) => {
  try {
    const { data } = await api.patch('/profile', payload, {
      withCredentials: true,
    });
    return data.data;
  } catch (err) {
    console.error('updateProfile error', err);
    throw err;
  }
};

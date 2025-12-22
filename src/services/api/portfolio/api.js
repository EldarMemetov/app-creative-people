import { api } from '../lib/api';

export const uploadPortfolioFiles = async (formData, onProgress) => {
  try {
    const { data } = await api.post('/portfolio', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e) => {
        onProgress?.(Math.round((e.loaded * 100) / (e.total || 1)));
      },
    });

    return data.data;
  } catch (err) {
    console.error('uploadPortfolioFiles error', err);
    throw err;
  }
};

export const deletePortfolioItem = async (itemId) => {
  try {
    const { data } = await api.delete(`/portfolio/${itemId}`, {
      withCredentials: true,
    });
    return data;
  } catch (err) {
    console.error('deletePortfolioItem error', err);
    throw err;
  }
};

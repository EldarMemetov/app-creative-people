import { api } from '../lib/api';

export const uploadPortfolioFiles = async (formData, onProgress) => {
  const { data } = await api.post('/portfolio', formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      onProgress?.(Math.round((e.loaded * 100) / (e.total || 1)));
    },
  });

  return data.data;
};

export const setHeroMode = async (heroType) => {
  const { data } = await api.patch(
    '/portfolio/mode',
    { heroType },
    { withCredentials: true }
  );
  return data.data;
};

export const deletePortfolioItem = async (itemId) => {
  const { data } = await api.delete(`/portfolio/${itemId}`, {
    withCredentials: true,
  });
  return data.data;
};

export const clearPortfolio = async () => {
  const { data } = await api.delete('/portfolio', { withCredentials: true });
  return data.data; // { heroType: null, heroMedia: [] }
};

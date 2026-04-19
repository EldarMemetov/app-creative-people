import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

// Подтвердить съёмку (автор)
export const confirmShooting = async (postId) => {
  try {
    const { data } = await api.post(`/posts/${postId}/confirm-shooting`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

// Добавить отзыв
export const addReview = async (postId, { text, rating }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/review`, {
      text,
      rating,
    });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

// Обновить отзыв
export const updateReview = async (reviewId, { text, rating }) => {
  try {
    const { data } = await api.patch(`/reviews/${reviewId}`, { text, rating });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

// Удалить отзыв
export const deleteReview = async (reviewId) => {
  try {
    const { data } = await api.delete(`/reviews/${reviewId}`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

// Добавить результаты (автор) - с фото
export const addResults = async (postId, { photos = [], videoLinks = [] }) => {
  try {
    const form = new FormData();

    photos.forEach((file) => {
      form.append('photos', file);
    });

    if (videoLinks.length > 0) {
      form.append('videoLinks', JSON.stringify(videoLinks));
    }

    const { data } = await api.post(`/posts/${postId}/results`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

// Обновить результаты
export const updateResults = async (
  postId,
  { photos = [], videoLinks, removePhotos = [] }
) => {
  try {
    const form = new FormData();

    photos.forEach((file) => {
      form.append('photos', file);
    });

    if (videoLinks !== undefined) {
      form.append('videoLinks', JSON.stringify(videoLinks));
    }

    if (removePhotos.length > 0) {
      form.append('removePhotos', JSON.stringify(removePhotos));
    }

    const { data } = await api.patch(`/posts/${postId}/results`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

// Получить завершённые проекты пользователя
export const getUserCompletedProjects = async (userId) => {
  try {
    const { data } = await api.get(`/users/${userId}/completed-projects`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

// Получить отзывы пользователя
export const getUserReviews = async (userId) => {
  try {
    const { data } = await api.get(`/users/${userId}/reviews`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

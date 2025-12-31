// services/api/comments.js
import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const getComments = async (postId, { page = 1, limit = 50 } = {}) => {
  try {
    const { data } = await api.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });

    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const addComment = async (postId, text) => {
  try {
    const { data } = await api.post(`/posts/${postId}/comment`, { text });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const updateComment = async (postId, commentId, text) => {
  try {
    const { data } = await api.patch(`/posts/${postId}/comments/${commentId}`, {
      text,
    });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const { data } = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

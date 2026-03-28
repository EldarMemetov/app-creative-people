import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const deleteCommentAsModerator = async (commentId) => {
  if (!commentId) throw new Error('commentId is required');
  try {
    const { data } = await api.delete(`/moderation/comments/${commentId}`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const deletePostAsModerator = async (postId) => {
  if (!postId) throw new Error('postId is required');
  try {
    const { data } = await api.delete(`/moderation/posts/${postId}`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const blockUser = async (userId) => {
  if (!userId) throw new Error('userId is required');
  try {
    const { data } = await api.patch(`/moderation/users/${userId}/block`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const unblockUser = async (userId) => {
  if (!userId) throw new Error('userId is required');
  try {
    const { data } = await api.patch(`/moderation/users/${userId}/unblock`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

/**
 * Получить всех пользователей (только модератор/админ)
 */
export const getAllUsers = async () => {
  try {
    const { data } = await api.get('/moderation/users');
    return data.data;
  } catch (err) {
    throw handleError(err);
  }
};

/**
 * Получить все посты (только модератор/админ)
 */
export const getAllPosts = async () => {
  try {
    const { data } = await api.get('/moderation/posts');
    return data.data;
  } catch (err) {
    throw handleError(err);
  }
};

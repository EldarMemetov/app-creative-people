import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const getAllPosts = async (params = {}) => {
  try {
    const res = await api.get('/posts', { params });

    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const getPostById = async (id) => {
  if (!id) throw new Error('Post id is required');
  try {
    const res = await api.get(`/posts/${id}`);
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};
export const likePost = async (postId) => {
  try {
    const { data } = await api.patch(`/posts/${postId}/like`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const unlikePost = async (postId) => {
  try {
    const { data } = await api.patch(`/posts/${postId}/like`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getPostLikeStatus = async (postId) => {
  try {
    const { data } = await api.get(`/posts/${postId}/like`);
    return data.data;
  } catch (error) {
    throw handleError(error);
  }
};

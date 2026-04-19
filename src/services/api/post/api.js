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

export const toggleFavorite = async ({ targetType = 'post', targetId }) => {
  try {
    const { data } = await api.patch('/favorites/toggle', {
      targetType,
      targetId,
    });
    return data;
  } catch (err) {
    try {
      const { data } = await api.patch(`/posts/${targetId}/favorite`);
      return data;
    } catch (e) {
      throw handleError(err);
    }
  }
};

export const getMyFavorites = async ({
  type = 'post',
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const { data } = await api.get('/favorites', {
      params: { type, page, limit },
    });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const createPost = async (payload) => {
  try {
    const res = await api.post('/posts/add', payload);
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const createPostWithMedia = async ({ payload, files = [] }) => {
  try {
    const form = new FormData();

    Object.entries(payload || {}).forEach(([key, val]) => {
      if (val === undefined || val === null) return;

      if (key === 'roleSlots' && Array.isArray(val)) {
        form.append(key, JSON.stringify(val));
      } else {
        form.append(key, String(val));
      }
    });

    files.forEach((f) => {
      form.append('files', f);
    });

    const res = await api.post('/posts', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const updatePost = async (postId, payload) => {
  if (!postId) throw new Error('postId is required');
  try {
    const res = await api.patch(`/posts/${postId}`, payload);
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const deletePost = async (postId) => {
  if (!postId) throw new Error('postId is required');
  try {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const uploadPostMedia = async (postId, files = []) => {
  if (!postId) throw new Error('postId is required');
  try {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const res = await api.post(`/posts/${postId}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

export async function deletePostMedia(postId, mediaId) {
  if (!postId) throw new Error('postId is required');
  if (!mediaId) throw new Error('mediaId is required');
  try {
    const res = await api.delete(`/posts/${postId}/media/${mediaId}`);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
}

export const getMyPosts = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await api.get('/posts/mine', { params: { page, limit } });
  return data;
};

export const extendPostDate = async (postId, newDate) => {
  if (!postId) throw new Error('postId is required');
  if (!newDate) throw new Error('newDate is required');
  try {
    const res = await api.patch(`/posts/${postId}/extend`, { newDate });
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

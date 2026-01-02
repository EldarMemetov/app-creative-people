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

export const addComment = async (
  postId,
  text,
  { parentComment = null, replyTo = null } = {}
) => {
  try {
    const body = { text };
    if (parentComment) body.parentComment = parentComment;
    if (replyTo) body.replyTo = replyTo;
    const { data } = await api.post(`/posts/${postId}/comment`, body);
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

export const toggleCommentLike = async (postId, commentId) => {
  try {
    const { data } = await api.patch(
      `/posts/${postId}/comments/${commentId}/like`
    );
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

// targetType: 'post' | 'forumTopic'
const basePath = (targetType, targetId) => {
  if (targetType === 'forumTopic') return `/forum/${targetId}`;
  return `/posts/${targetId}`;
};

export const getComments = async (
  targetType,
  targetId,
  { page = 1, limit = 50 } = {}
) => {
  try {
    const { data } = await api.get(
      `${basePath(targetType, targetId)}/comments`,
      {
        params: { page, limit },
      }
    );
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const addComment = async (
  targetType,
  targetId,
  text,
  { parentComment = null, replyTo = null } = {}
) => {
  try {
    const body = { text };
    if (parentComment) body.parentComment = parentComment;
    if (replyTo) body.replyTo = replyTo;
    const { data } = await api.post(
      `${basePath(targetType, targetId)}/comment`,
      body
    );
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const updateComment = async (targetType, targetId, commentId, text) => {
  try {
    const { data } = await api.patch(
      `${basePath(targetType, targetId)}/comments/${commentId}`,
      { text }
    );
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const deleteComment = async (targetType, targetId, commentId) => {
  try {
    const { data } = await api.delete(
      `${basePath(targetType, targetId)}/comments/${commentId}`
    );
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const toggleCommentLike = async (targetType, targetId, commentId) => {
  try {
    const { data } = await api.patch(
      `${basePath(targetType, targetId)}/comments/${commentId}/like`
    );
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

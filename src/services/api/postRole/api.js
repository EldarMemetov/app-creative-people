import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const getPostById = async (id) => {
  try {
    const res = await api.get(`/posts/${id}`);

    return res.data?.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

export const applyToPost = async (postId, { appliedRole, message = '' }) => {
  try {
    const res = await api.patch(`/posts/${postId}/apply`, {
      appliedRole,
      message,
    });
    return res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};
export const assignCandidates = async (postId, assignments = []) => {
  try {
    const res = await api.patch(`/posts/${postId}/assign`, { assignments });

    return res.data?.data ?? res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

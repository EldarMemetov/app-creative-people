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
export const withErrorHandling = async (request) => {
  try {
    const res = await request;
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
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
export const fetchMyApplications = async ({ status } = {}) => {
  try {
    const res = await api.get('/posts/applications/mine', {
      params: status ? { status } : undefined,
    });
    return res.data?.data ?? [];
  } catch (err) {
    handleError(err);
    throw err;
  }
};

export const withdrawApplication = async (applicationId) => {
  try {
    const res = await api.patch(
      `/posts/applications/${applicationId}/withdraw`
    );
    return res.data?.data ?? res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

export const rejectApplication = async (postId, applicationId) => {
  try {
    const res = await api.patch(
      `/posts/${postId}/applications/${applicationId}/reject`
    );
    return res.data?.data ?? res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

export const unassignCandidate = async (postId, applicationId) => {
  try {
    const res = await api.patch(`/posts/${postId}/unassign`, {
      applicationId,
    });
    return res.data?.data ?? res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

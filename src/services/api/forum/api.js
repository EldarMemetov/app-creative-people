import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const getTopics = async ({
  page = 1,
  limit = 20,
  sort = 'new',
  category,
  tag,
  q,
} = {}) => {
  try {
    const { data } = await api.get('/forum', {
      params: { page, limit, sort, category, tag, q },
    });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const getTopicById = async (id) => {
  try {
    const { data } = await api.get(`/forum/${id}`);
    return data?.data ?? data;
  } catch (err) {
    throw handleError(err);
  }
};

export const createTopic = async (payload) => {
  try {
    const { data } = await api.post('/forum', payload);
    return data?.data ?? data;
  } catch (err) {
    throw handleError(err);
  }
};

export const updateTopic = async (id, payload) => {
  try {
    const { data } = await api.patch(`/forum/${id}`, payload);
    return data?.data ?? data;
  } catch (err) {
    throw handleError(err);
  }
};

export const deleteTopic = async (id) => {
  try {
    const { data } = await api.delete(`/forum/${id}`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const toggleTopicLike = async (id) => {
  try {
    const { data } = await api.patch(`/forum/${id}/like`);
    return data?.data ?? data;
  } catch (err) {
    throw handleError(err);
  }
};

export const moderateTopic = async (id, { pinned, closed } = {}) => {
  try {
    const body = {};
    if (typeof pinned === 'boolean') body.pinned = pinned;
    if (typeof closed === 'boolean') body.closed = closed;
    const { data } = await api.patch(`/forum/${id}/moderate`, body);
    return data?.data ?? data;
  } catch (err) {
    throw handleError(err);
  }
};

import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const fetchNotifications = async ({
  page = 1,
  limit = 50,
  unread,
} = {}) => {
  try {
    const params = { page, limit };
    if (unread) params.unread = 'true';
    const { data } = await api.get('/notifications', { params });
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const markNotificationRead = async (id) => {
  try {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const { data } = await api.post(`/notifications/read-all`);
    return data;
  } catch (err) {
    throw handleError(err);
  }
};

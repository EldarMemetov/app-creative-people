import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

const withErrorHandling = async (request) => {
  try {
    const res = await request;
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const normalizeDate = (date) => {
  if (!date) return null;

  if (date instanceof Date) {
    return date.toISOString();
  }

  return new Date(date).toISOString();
};

export const fetchCalendarEvents = async ({ showExpired = false } = {}) => {
  return withErrorHandling(
    api.get('/calendar', {
      params: {
        showExpired: showExpired ? 'true' : 'false',
      },
    })
  );
};

export const createCalendarEvent = async ({
  title,
  description = '',
  date,
  participants = [],
}) => {
  return withErrorHandling(
    api.post('/calendar', {
      title,
      description,
      date: normalizeDate(date),
      participants,
    })
  );
};

export const updateCalendarEvent = async (id, data) => {
  return withErrorHandling(
    api.patch(`/calendar/${id}`, {
      ...data,
      date: data?.date ? normalizeDate(data.date) : undefined,
    })
  );
};

export const deleteCalendarEvent = async (id) => {
  return withErrorHandling(api.delete(`/calendar/${id}`));
};

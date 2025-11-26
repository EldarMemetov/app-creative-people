import axios from 'axios';

export const handleError = (error) => {
  if (!axios.isAxiosError(error)) {
    return {
      message: 'Network error. Please check your connection.',
      status: null,
    };
  }

  const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.response?.data?.msg ||
    'Unexpected error';

  const messages = {
    400: message || 'Invalid request',
    401: message || 'Invalid email or password',
    403: 'Access denied',
    404: message || 'Resource not found',
    409: message || 'This email is already registered',
    500: 'Internal server error. Try again later',
  };

  return {
    message: messages[status] || message,
    status: status,
  };
};

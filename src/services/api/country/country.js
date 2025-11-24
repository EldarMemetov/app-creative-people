import { api } from '../lib/api';
import { handleError } from '@/utils/errorHandler';

export const getAllCountries = async () => {
  try {
    const res = await api.get('/location/countries');
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const getCitiesByCountry = async (countryCode) => {
  try {
    const res = await api.get(`/location/cities/${countryCode}`);
    return res.data.data;
  } catch (err) {
    throw handleError(err);
  }
};

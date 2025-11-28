import * as Yup from 'yup';

export const EditProfileSchema = (t) =>
  Yup.object().shape({
    name: Yup.string().min(2).max(50).required(t('required')),
    surname: Yup.string().min(2).max(50).required(t('required')),
    country: Yup.string().required(t('required')),
    city: Yup.string().required(t('required')),
    aboutMe: Yup.string().max(500),
    experience: Yup.string().max(200),
  });

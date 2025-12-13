import * as Yup from 'yup';

export const EditProfileSchema = (t) =>
  Yup.object().shape({
    name: Yup.string().min(2).max(50).required(t('required')),
    surname: Yup.string().min(2).max(50).required(t('required')),
    country: Yup.string().required(t('required')),
    city: Yup.string().required(t('required')),
    aboutMe: Yup.string().min(10).max(500).required(t('required')),
    experience: Yup.string().min(10).max(200).required(t('required')),
    directions: Yup.array()
      .min(1, t('choose_at_least_one', { ns: 'directions' }))
      .max(6, t('max_six', { ns: 'directions' })),
    roles: Yup.array()
      .min(1, t('choose_at_least_one', { ns: 'roles' }))
      .max(3, t('max_three', { ns: 'roles' })),
  });

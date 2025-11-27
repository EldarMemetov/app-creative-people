import * as Yup from 'yup';

export const RegisterSchema = (t) =>
  Yup.object().shape({
    name: Yup.string()
      .min(2, t('name_min', { min: 2 }))
      .max(50, t('name_max', { max: 50 }))
      .required(t('required_field')),
    surname: Yup.string()
      .min(2, t('surname_min', { min: 2 }))
      .max(50, t('surname_max', { max: 50 }))
      .required(t('required_field')),
    country: Yup.string().required(t('required_field')),
    city: Yup.string().required(t('required_field')),
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
    password: Yup.string()
      .min(6, t('password_min'))
      .max(128, t('password_max'))
      .required(t('required_field')),
    role: Yup.string().required(t('required_field')),
  });

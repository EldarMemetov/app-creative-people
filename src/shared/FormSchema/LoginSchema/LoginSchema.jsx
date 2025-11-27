import * as Yup from 'yup';
export const LoginSchema = (t) =>
  Yup.object().shape({
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
    password: Yup.string()
      .min(6, t('password_min'))
      .required(t('required_field')),
  });

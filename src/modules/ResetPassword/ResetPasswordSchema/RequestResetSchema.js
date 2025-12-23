import * as Yup from 'yup';

export const RequestResetSchema = (t) =>
  Yup.object().shape({
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
  });

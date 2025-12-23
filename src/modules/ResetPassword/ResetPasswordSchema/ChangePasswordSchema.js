import * as Yup from 'yup';
export const ChangePasswordSchema = (t) =>
  Yup.object().shape({
    currentPassword: Yup.string()
      .min(6, t('password_min'))
      .required(t('required_field')),
    newPassword: Yup.string()
      .min(6, t('password_min'))
      .required(t('required_field')),
    confirmNew: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('passwords_must_match'))
      .required(t('required_field')),
  });

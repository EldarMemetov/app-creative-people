import * as Yup from 'yup';

export const ResetPwdSchema = (t) =>
  Yup.object().shape({
    password: Yup.string()
      .min(6, t('password_min'))
      .required(t('required_field')),
    confirm: Yup.string()
      .oneOf([Yup.ref('password')], t('passwords_must_match'))
      .required(t('required_field')),
  });

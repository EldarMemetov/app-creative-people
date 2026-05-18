import * as Yup from 'yup';

export const ContactSchema = (t) =>
  Yup.object().shape({
    name: Yup.string()
      .min(2, t('name_min', { min: 2 }))
      .max(80, t('name_max', { max: 80 }))
      .required(t('required_field')),
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
    message: Yup.string()
      .min(10, t('message_min', { min: 10 }))
      .max(2000, t('message_max', { max: 2000 }))
      .required(t('required_field')),
    agreedToPolicy: Yup.boolean()
      .oneOf([true], t('must_agree_policy'))
      .required(t('must_agree_policy')),
  });

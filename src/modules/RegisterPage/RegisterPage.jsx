'use client';

import s from './RegisterPage.module.scss';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../../services/api/auth/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../services/store/useAuth.js';
import Container from '@/shared/container/Container';
import { useTranslation } from 'react-i18next';
import roles from '@/utils/roles.js';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const { t } = useTranslation(['register']);

  const RegisterSchema = Yup.object().shape({
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

  return (
    <Container>
      <div className={s.section}>
        <h1>{t('register')}</h1>

        <Formik
          initialValues={{
            name: '',
            surname: '',
            country: '',
            city: '',
            email: '',
            password: '',
            role: 'model',
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, actions) => {
            actions.setSubmitting(true);
            try {
              await registerUser(values);
              await auth.login(values.email, values.password);
              toast.success(t('register_success'));
              router.push('/profile');
            } catch (err) {
              if (err.status === 409) {
                actions.setFieldError('email', t('email_already_exist'));
              } else {
                toast.error(err.message || t('register_failed'));
              }
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              <label>{t('name')}</label>
              <Field name="name" />
              <ErrorMessage
                name="name"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('surname')}</label>
              <Field name="surname" />
              <ErrorMessage
                name="surname"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('country')}</label>
              <Field name="country" placeholder={t('country_placeholder')} />
              <ErrorMessage
                name="country"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('city')}</label>
              <Field name="city" placeholder={t('city_placeholder')} />
              <ErrorMessage
                name="city"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('email')}</label>
              <Field type="email" name="email" autoComplete="email" />
              <ErrorMessage
                name="email"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('password')}</label>
              <Field
                name="password"
                type="password"
                autoComplete="new-password"
              />
              <ErrorMessage
                name="password"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('role')}</label>
              <div className={s.roleGrid}>
                {roles.map((role) => (
                  <div
                    key={role}
                    className={`${s.roleCard} ${
                      values.role === role ? s.active : ''
                    }`}
                    onClick={() => setFieldValue('role', role)}
                  >
                    {t(`roles.${role}`)}
                  </div>
                ))}
              </div>
              <ErrorMessage
                name="role"
                component="p"
                style={{ color: 'red' }}
              />

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('loading') : t('submit')}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
}

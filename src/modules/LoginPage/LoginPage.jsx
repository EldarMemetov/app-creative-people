'use client';
import s from './LoginPage.module.scss';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../services/store/useAuth.js';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Container from '@/shared/container/Container';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation(['login']);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t('invalid_email')).required(t('required_field')),
    password: Yup.string()
      .min(6, t('password_min'))
      .required(t('required_field')),
  });

  return (
    <Container>
      <div className={s.section}>
        <h1>{t('login')}</h1>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, actions) => {
            actions.setSubmitting(true);

            try {
              await auth.login(values.email, values.password);
              toast.success(t('login_success'));
              router.push('/profile');
            } catch (err) {
              if (err.status === 401) {
                actions.setFieldError('email', t('login_failed'));
                actions.setFieldError('password', t('login_failed'));
              } else {
                toast.error(err.message || t('login_failed'));
              }
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <label>{t('email')}</label>
              <Field name="email" type="email" autoComplete="email" />
              <ErrorMessage
                name="email"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('password')}</label>
              <Field
                name="password"
                type="password"
                autoComplete="current-password"
              />
              <ErrorMessage
                name="password"
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

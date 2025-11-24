'use client';

import s from './RegisterPage.module.scss';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../../services/api/auth/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../services/store/useAuth.js';
import Container from '@/shared/container/Container';
import { useTranslation } from 'react-i18next';
import roles from '@/utils/roles.js';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().min(2).max(50).required('Required'),
  surname: Yup.string().min(2).max(50).required('Required'),
  country: Yup.string().required('Required'),
  city: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6).max(128).required('Required'),
  role: Yup.string().required('Select a role'),
});

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const [serverError, setServerError] = useState('');
  const { t } = useTranslation(['register']);

  return (
    <Container>
      <div className={s.section}>
        <h1>{t('register')}</h1>

        {serverError && <p style={{ color: 'red' }}>{serverError}</p>}

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
            setServerError('');
            try {
              await registerUser(values);
              await auth.login(values.email, values.password);
              router.push('/profile');
            } catch (err) {
              setServerError(err.message || 'Registration failed');
            }
            actions.setSubmitting(false);
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
              <Field name="country" placeholder="Enter your country" />
              <ErrorMessage
                name="country"
                component="p"
                style={{ color: 'red' }}
              />

              <label>{t('city')}</label>
              <Field name="city" placeholder="Enter your city" />
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
                {isSubmitting ? 'Loading...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
}

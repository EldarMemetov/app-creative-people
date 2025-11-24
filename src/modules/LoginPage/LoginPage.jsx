'use client';
import s from './LoginPage.module.scss';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../services/store/useAuth.js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Container from '@/shared/container/Container';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  return (
    <Container>
      <div className={s.section}>
        <h1>Login</h1>

        {serverError && <p style={{ color: 'red' }}>{serverError}</p>}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, actions) => {
            setServerError('');

            try {
              await auth.login(values.email, values.password);
              router.push('/profile');
            } catch (err) {
              setServerError(err.message);
            }

            actions.setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <label>Email</label>
              <Field name="email" type="email" autoComplete="email" />
              <ErrorMessage
                name="email"
                component="p"
                style={{ color: 'red' }}
              />

              <label>Password</label>
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
                {isSubmitting ? 'Loading...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
}

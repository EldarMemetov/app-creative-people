'use client';

import React, { useEffect, useState } from 'react';
import Container from '@/shared/container/Container';
import { Formik, Form } from 'formik';
import FormInput from '@/shared/FormInput/FormInput';
import { ResetPwdSchema } from '../ResetPasswordSchema/ResetPasswordSchema';
import { resetPassword } from '@/services/api/auth/auth';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
  const search = useSearchParams();
  const token = search?.get('token') ?? '';
  const router = useRouter();
  const { t } = useTranslation(['resetPassword']);
  const schema = ResetPwdSchema(t);
  const [tokenValid, setTokenValid] = useState(!!token);

  useEffect(() => {
    if (!token) {
      toast.error(t('token_missing'));
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token, t]);

  if (!tokenValid) {
    return (
      <Container>
        <div style={{ maxWidth: 560 }}>
          <h1>{t('token_missing')}</h1>
          <p>{t('open_email_link')}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ maxWidth: 560 }}>
        <h1>{t('set_new_password')}</h1>

        <Formik
          initialValues={{ password: '', confirm: '' }}
          validationSchema={schema}
          validateOnBlur
          validateOnChange
          onSubmit={async (values, actions) => {
            actions.setSubmitting(true);
            try {
              await resetPassword({ token, password: values.password });
              toast.success(t('password_reset_success'));
              router.push('/login');
            } catch (err) {
              const msg = err?.message || err?.data?.message;
              toast.error(msg);
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormInput
                label={t('new_password')}
                name="password"
                type="password"
              />
              <FormInput
                label={t('confirm_password')}
                name="confirm"
                type="password"
              />

              <button
                type="submit"
                disabled={isSubmitting || !token}
                style={{ marginTop: 12 }}
              >
                {isSubmitting ? t('saving') : t('save')}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
}

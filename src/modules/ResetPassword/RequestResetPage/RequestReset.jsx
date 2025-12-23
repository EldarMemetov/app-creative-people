'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import Container from '@/shared/container/Container';
import FormInput from '@/shared/FormInput/FormInput';
import { RequestResetSchema } from '../ResetPasswordSchema/RequestResetSchema';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { requestResetEmail } from '@/services/api/auth/auth';

export default function RequestResetPage() {
  const { t } = useTranslation(['resetPassword']);
  const schema = RequestResetSchema(t);
  const [serverError, setServerError] = useState('');

  return (
    <Container>
      <div style={{ maxWidth: 560 }}>
        <h1>{t('forgot_password')}</h1>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={schema}
          onSubmit={async (values, actions) => {
            actions.setSubmitting(true);
            setServerError('');

            try {
              await requestResetEmail(values.email);

              toast.success(t('reset_email_sent'));
              actions.resetForm();
            } catch (err) {
              console.error('[RequestResetPage] requestResetEmail error', err);

              const status = err?.status ?? null;

              if (!status || status >= 500) {
                const msg = t('invalid_email');
                setServerError(msg);
                toast.error(msg);
              } else {
                toast.error(t('sending_error'));
                actions.resetForm();
              }
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <FormInput label={t('email')} name="email" type="email" />

              {serverError && (
                <p style={{ color: 'red', fontSize: 14, marginTop: 4 }}>
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ marginTop: 12 }}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? t('sending') : t('send')}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
}

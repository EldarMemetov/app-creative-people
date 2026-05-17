'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import Link from 'next/link';
import Container from '@/shared/container/Container';
import FormInput from '@/shared/FormInput/FormInput';
import { RequestResetSchema } from '../ResetPasswordSchema/RequestResetSchema';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { requestResetEmail } from '@/services/api/auth/auth';
import { LINKDATA } from '@/shared/constants';
import s from './RequestReset.module.scss';

export default function RequestResetPage() {
  const { t } = useTranslation(['resetPassword']);
  const schema = RequestResetSchema(t);
  const [serverError, setServerError] = useState('');

  return (
    <section className={s.page}>
      <div className={s.bg}>
        <div className={s.glowBlue} />
        <div className={s.glowViolet} />
        <div className={s.grid} />
      </div>

      <Container>
        <div className={s.inner}>
          <div className={s.card}>
            <h1 className={s.title}>{t('forgot_password')}</h1>
            <p className={s.subtitle}>{t('forgot_password_hint') || ''}</p>

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
                  console.error(
                    '[RequestResetPage] requestResetEmail error',
                    err
                  );

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
                <Form className={s.form} noValidate>
                  <div className={s.field}>
                    <FormInput label={t('email')} name="email" type="email" />
                  </div>

                  {serverError && (
                    <p className={s.serverError} role="alert">
                      {serverError}
                    </p>
                  )}

                  <div className={s.actions}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={s.submit}
                      aria-busy={isSubmitting}
                      data-testid="request-reset-submit-button"
                    >
                      <span className={s.submitLabel}>
                        {isSubmitting ? t('sending') : t('send')}
                      </span>
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            <p className={s.backHint}>
              {t('remember_password')}{' '}
              <Link
                href={LINKDATA.LOGIN}
                className={s.backLink}
                data-testid="request-reset-back-to-login"
              >
                {t('back_to_login')}
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

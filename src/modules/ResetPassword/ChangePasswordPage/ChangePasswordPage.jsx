'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import Container from '@/shared/container/Container';
import FormInput from '@/shared/FormInput/FormInput';
import { useAuth } from '@/services/store/useAuth';
import { ChangePasswordSchema } from '../ResetPasswordSchema/ChangePasswordSchema';
import { changePassword } from '@/services/api/auth/auth.js';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import s from './ChangePasswordPage.module.scss';

export default function ChangePasswordPage() {
  const { t } = useTranslation(['resetPassword']);
  const schema = ChangePasswordSchema(t);
  const auth = useAuth();

  const handleChangePassword = async (values, actions) => {
    actions.setSubmitting(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success(t('password_change_success'));
      actions.resetForm();

      auth.setAccessToken(null);
      auth.setUser(null);
    } catch (err) {
      const serverMsg = err?.response?.data?.message;

      if (
        err?.response?.status === 401 ||
        (typeof serverMsg === 'string' &&
          serverMsg.toLowerCase().includes('current password'))
      ) {
        actions.setFieldError(
          'currentPassword',
          t('current_password_incorrect')
        );
      } else {
        const msg = serverMsg || t('password_change_failed') || 'Error';
        toast.error(msg);
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <section className={s.page}>
      <Container>
        <div className={s.inner}>
          <div className={s.card}>
            <h1 className={s.title}>{t('change_password')}</h1>
            <p className={s.subtitle}>{t('change_password_hint') || ''}</p>

            <Formik
              initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmNew: '',
              }}
              validationSchema={schema}
              onSubmit={handleChangePassword}
            >
              {({ isSubmitting }) => (
                <Form className={s.form} autoComplete="on">
                  <input
                    name="username"
                    type="text"
                    autoComplete="username"
                    className={s.visuallyHidden}
                  />

                  <div className={s.field}>
                    <FormInput
                      label={t('current_password')}
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className={s.field}>
                    <FormInput
                      label={t('new_password')}
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className={s.field}>
                    <FormInput
                      label={t('confirm_new_password')}
                      name="confirmNew"
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className={s.actions}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={s.submit}
                    >
                      <span className={s.submitLabel}>
                        {isSubmitting ? t('saving') : t('save')}
                      </span>
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Container>
    </section>
  );
}

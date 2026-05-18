'use client';

import s from './ContactSection.module.scss';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import Container from '@/shared/container/Container';
import FormInput from '@/shared/FormInput/FormInput';
import { ContactSchema } from '@/shared/ContactSchema/ContactSchema';
import { sendContactMessage } from '@/services/api/contacts/api';
import { LINKDATA } from '@/shared/constants';
import Icon from '@/shared/Icon/Icon';

export default function ContactSection() {
  const { t } = useTranslation(['contact']);
  const schema = ContactSchema(t);

  return (
    <section className={s.section}>
      <Container>
        <div className={s.inner}>
          <div className={s.card}>
            <h1 className={s.title}>{t('title')}</h1>
            <p className={s.subtitle}>{t('subtitle')}</p>

            <Formik
              initialValues={{
                name: '',
                email: '',
                message: '',
                agreedToPolicy: false,
              }}
              validationSchema={schema}
              onSubmit={async (values, actions) => {
                actions.setSubmitting(true);
                try {
                  await sendContactMessage(values);
                  toast.success(t('success'));
                  actions.resetForm();
                } catch (err) {
                  toast.error(err?.message || t('failed'));
                } finally {
                  actions.setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className={s.form} noValidate>
                  <div className={s.field}>
                    <FormInput label={t('name')} name="name" />
                  </div>

                  <div className={s.field}>
                    <FormInput label={t('email')} name="email" type="email" />
                  </div>

                  <div className={s.field}>
                    <FormInput
                      label={t('message')}
                      name="message"
                      as="textarea"
                      placeholder={t('message_placeholder')}
                    />
                  </div>

                  <div className={s.policy}>
                    <label className={s.policyLabel}>
                      <Field
                        type="checkbox"
                        name="agreedToPolicy"
                        className={s.policyCheckbox}
                        data-testid="contact-policy-checkbox"
                      />
                      <span className={s.policyBox} aria-hidden="true">
                        <Icon
                          iconName="icon-check"
                          className={s.policyCheck}
                          aria-hidden="true"
                        />
                      </span>
                      <span className={s.policyText}>
                        {t('agree_with')}{' '}
                        <Link
                          href={`/${LINKDATA.POLICY}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.policyLink}
                        >
                          {t('privacy_policy')}
                        </Link>
                      </span>
                    </label>
                    <ErrorMessage
                      name="agreedToPolicy"
                      component="p"
                      className={s.error}
                    />
                  </div>

                  <div className={s.actions}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={s.submit}
                      data-testid="contact-submit-button"
                    >
                      <span className={s.submitLabel}>
                        {isSubmitting ? t('sending') : t('submit')}
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

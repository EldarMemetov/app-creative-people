'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '@/shared/FormInput/FormInput';
import s from './CommentForm.module.scss';
import EmojiButton from '@/shared/components/EmojiButton/EmojiButton';
import { useTranslation } from 'react-i18next';

export default function CommentForm({ initial = '', onSubmit, submitLabel }) {
  const { t } = useTranslation(['comments']);

  const CommentSchema = Yup.object().shape({
    text: Yup.string()
      .trim()
      .min(1, t('errors.emptyText'))
      .max(500, t('errors.maxLength'))
      .required(t('errors.requiredText')),
  });

  return (
    <Formik
      initialValues={{ text: initial }}
      validationSchema={CommentSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await onSubmit(values.text);
          resetForm();
        } catch (e) {
          console.error('comment submit error', e);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className={s.commentForm}>
          <FormInput
            name="text"
            as="textarea"
            placeholder={t('form.placeholder')}
          />
          <div className={s.formActions}>
            <EmojiButton
              fieldName="text"
              aria-label={t('form.emojiButtonLabel')}
            />
            <button type="submit" className={s.btn} disabled={isSubmitting}>
              {submitLabel || t('actions.submit')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

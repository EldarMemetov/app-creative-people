'use client';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '@/shared/FormInput/FormInput';
import s from './CommentForm.module.scss';

const CommentSchema = Yup.object().shape({
  text: Yup.string().min(1).max(500).required('Введите текст'),
});

export default function CommentForm({
  initial = '',
  onSubmit,
  submitLabel = 'Отправить',
}) {
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
            placeholder="Написать комментарий..."
          />
          <div className={s.formActions}>
            <button type="submit" className={s.btn} disabled={isSubmitting}>
              {submitLabel}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

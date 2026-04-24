'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '@/shared/FormInput/FormInput';
import s from '../Forum.module.scss';

const Schema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, 'Минимум 3 символа')
    .max(200)
    .required('Обязательно'),
  body: Yup.string().trim().max(5000),
  tagsInput: Yup.string().max(300),
  category: Yup.string().trim().max(50),
});

export default function TopicForm({
  initial = {},
  onSubmit,
  submitLabel = 'Сохранить',
}) {
  const initialValues = {
    title: initial.title || '',
    body: initial.body || '',
    tagsInput: (initial.tags || []).join(', '),
    category: initial.category || '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Schema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const tags = values.tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 10);
          await onSubmit({
            title: values.title.trim(),
            body: values.body.trim(),
            tags,
            category: values.category.trim(),
          });
        } catch (e) {
          console.error('topic form submit error', e);
          alert(e?.message || 'Ошибка при сохранении');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className={s.form}>
          <FormInput name="title" placeholder="Заголовок темы" />
          <FormInput
            name="body"
            as="textarea"
            placeholder="Опиши о чём тема (необязательно)"
          />
          <FormInput name="tagsInput" placeholder="Теги через запятую (опц.)" />
          <FormInput name="category" placeholder="Категория (опц.)" />
          <button type="submit" className={s.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Отправка…' : submitLabel}
          </button>
        </Form>
      )}
    </Formik>
  );
}

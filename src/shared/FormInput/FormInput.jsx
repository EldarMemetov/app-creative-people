'use client';

import { Field, ErrorMessage } from 'formik';
import styles from './FormInput.module.scss';

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  as,
}) {
  return (
    <div className={styles.inputWrap}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}

      <Field
        id={name}
        name={name}
        placeholder={placeholder}
        as={as}
        className={as === 'textarea' ? styles.textarea : styles.input}
      />

      <ErrorMessage name={name} component="p" className={styles.error} />
    </div>
  );
}

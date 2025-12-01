'use client';

import { useState } from 'react';
import { Field, ErrorMessage } from 'formik';

import styles from './FormInput.module.scss';
import Icon from '../Icon/Icon';

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  as,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={styles.inputWrap}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputInner}>
        <Field
          id={name}
          name={name}
          placeholder={placeholder}
          as={as}
          type={inputType}
          autoComplete={
            type === 'password'
              ? 'current-password'
              : name === 'email'
                ? 'username'
                : undefined
          }
          className={as === 'textarea' ? styles.textarea : styles.input}
        />

        {type === 'password' && (
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <Icon
              className={styles.icon}
              iconName={showPassword ? 'icon-eye-off' : 'icon-eye'}
            />
          </button>
        )}
      </div>

      <ErrorMessage name={name} component="p" className={styles.error} />
    </div>
  );
}

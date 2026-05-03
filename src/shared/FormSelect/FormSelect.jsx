import { Field, ErrorMessage } from 'formik';
import styles from './FormSelect.module.scss';
import Icon from '../Icon/Icon';

export default function FormSelect({
  label,
  name,
  options = [],
  placeholder = '',
  showPlaceholder = true,
}) {
  return (
    <div className={styles.wrap}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.selectInner}>
        <Field as="select" id={name} name={name} className={styles.select}>
          {showPlaceholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Field>

        <Icon
          iconName="icon-option"
          className={styles.chevron}
          width={14}
          height={14}
          aria-hidden="true"
        />
      </div>

      <ErrorMessage name={name} component="p" className={styles.error} />
    </div>
  );
}

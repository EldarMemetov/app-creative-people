'use client';

import { useTranslation } from 'react-i18next';
import s from './RoleSelector.module.scss';
import roles from '@/utils/roles.js';

const MAX_ROLES = 3;

export default function RoleSelector({ values = [], onChange, label, error }) {
  const { t } = useTranslation(['roles']);

  const toggleRole = (role) => {
    const isActive = values.includes(role);

    if (isActive) {
      onChange(values.filter((r) => r !== role));
      return;
    }

    if (values.length >= MAX_ROLES) return;

    onChange([...values, role]);
  };

  const limitReached = values.length >= MAX_ROLES;

  return (
    <div className={s.container}>
      <div className={s.header}>
        {label && <label className={s.label}>{label}</label>}
        <span className={`${s.counter} ${limitReached ? s.counterLimit : ''}`}>
          {values.length} / {MAX_ROLES}
        </span>
      </div>

      <div className={s.roleGrid}>
        {roles.map((role) => {
          const isActive = values.includes(role);
          const isDisabled = !isActive && limitReached;

          return (
            <button
              key={role}
              type="button"
              disabled={isDisabled}
              onClick={() => toggleRole(role)}
              className={`${s.roleCard} ${isActive ? s.active : ''} ${isDisabled ? s.disabled : ''}`}
            >
              <span className={s.text}>{t(role)}</span>
              <span className={s.check}>✓</span>
            </button>
          );
        })}
      </div>

      <div className={`${s.message} ${error ? s.errorVisible : ''}`}>
        {error}
      </div>
    </div>
  );
}

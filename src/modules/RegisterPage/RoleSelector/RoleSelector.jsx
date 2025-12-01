'use client';

import { useTranslation } from 'react-i18next';
import s from './RoleSelector.module.scss';
import roles from '@/utils/roles.js';

export default function RoleSelector({ value, onChange, label }) {
  const { t } = useTranslation(['roles']);
  return (
    <div>
      <h2>{t('role')}</h2>
      <div className={s.roleSelector}>
        {label && <label>{label}</label>}
        <div className={s.roleGrid}>
          {roles.map((role) => (
            <div
              key={role}
              className={`${s.roleCard} ${value === role ? s.active : ''}`}
              onClick={() => onChange(role)}
            >
              {t(role)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

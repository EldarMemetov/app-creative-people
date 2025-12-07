'use client';

import { useTranslation } from 'react-i18next';
import s from './RoleSelector.module.scss';
import roles from '@/utils/roles.js';

export default function RoleSelector({ values = [], onChange, label }) {
  const { t } = useTranslation(['roles']);

  const toggleRole = (role) => {
    const alreadySelected = values.includes(role);

    if (alreadySelected) {
      onChange(values.filter((r) => r !== role));
    } else {
      if (values.length >= 3) return;
      onChange([...values, role]);
    }
  };

  return (
    <div>
      <h2>{t('role')}</h2>

      <div className={s.roleSelector}>
        {label && <label>{label}</label>}

        <div className={s.roleGrid}>
          {roles.map((role) => (
            <div
              key={role}
              className={`${s.roleCard} ${values.includes(role) ? s.active : ''}`}
              onClick={() => toggleRole(role)}
            >
              {t(role)}
            </div>
          ))}
        </div>

        {values.length === 0 && (
          <p className={s.hint}>{t('choose_at_least_one')}</p>
        )}
      </div>
    </div>
  );
}

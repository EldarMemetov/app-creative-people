'use client';

import s from './RoleSelector.module.scss';
import roles from '@/utils/roles.js';

export default function RoleSelector({ value, onChange, t, label }) {
  return (
    <div className={s.roleSelector}>
      {label && <label>{label}</label>}
      <div className={s.roleGrid}>
        {roles.map((role) => (
          <div
            key={role}
            className={`${s.roleCard} ${value === role ? s.active : ''}`}
            onClick={() => onChange(role)}
          >
            {t(`roles.${role}`)}
          </div>
        ))}
      </div>
    </div>
  );
}

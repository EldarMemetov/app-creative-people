'use client';

import { useTranslation } from 'react-i18next';
import s from './DirectionsSelector.module.scss';
import { directionsEnum } from '@/utils/rolesEnum';

export default function DirectionsSelector({ values = [], onChange, label }) {
  const { t } = useTranslation(['directions']);

  const toggleDirection = (direction) => {
    const alreadySelected = values.includes(direction);
    if (alreadySelected) {
      onChange(values.filter((d) => d !== direction));
    } else {
      if (values.length >= 6) return;
      onChange([...values, direction]);
    }
  };

  return (
    <div className={s.container}>
      {label && <label className={s.label}>{label}</label>}

      <div className={s.directionsGrid}>
        {directionsEnum.map((direction) => {
          const isActive = values.includes(direction);
          return (
            <button
              key={direction}
              type="button"
              className={`${s.directionCard} ${isActive ? s.active : ''}`}
              onClick={() => toggleDirection(direction)}
            >
              {t(direction)}
              {isActive && <span className={s.checkmark}>✓</span>}
            </button>
          );
        })}
      </div>

      {values.length === 0 && (
        <p className={s.hint}>{t('choose_at_least_one')}</p>
      )}
    </div>
  );
}

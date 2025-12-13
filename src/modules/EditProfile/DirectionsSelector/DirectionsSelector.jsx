'use client';

import { useTranslation } from 'react-i18next';
import s from './DirectionsSelector.module.scss';
import { directionsEnum } from '@/utils/rolesEnum';

const MAX_DIRECTIONS = 6;

export default function DirectionsSelector({
  values = [],
  onChange,
  label,
  error,
}) {
  const { t } = useTranslation(['directions']);

  const toggleDirection = (direction) => {
    const isActive = values.includes(direction);

    if (isActive) {
      onChange(values.filter((d) => d !== direction));
      return;
    }

    if (values.length >= MAX_DIRECTIONS) return;

    onChange([...values, direction]);
  };

  const limitReached = values.length >= MAX_DIRECTIONS;

  return (
    <div className={s.container}>
      <div className={s.header}>
        {label && <label className={s.label}>{label}</label>}

        <span className={`${s.counter} ${limitReached ? s.counterLimit : ''}`}>
          {values.length} / {MAX_DIRECTIONS}
        </span>
      </div>

      <div className={s.directionsGrid}>
        {directionsEnum.map((direction) => {
          const isActive = values.includes(direction);
          const isDisabled = !isActive && limitReached;

          return (
            <button
              key={direction}
              type="button"
              disabled={isDisabled}
              onClick={() => toggleDirection(direction)}
              className={`${s.card}
                ${isActive ? s.active : ''}
                ${isDisabled ? s.disabled : ''}
              `}
            >
              <span className={s.text}>{t(direction)}</span>
              {isActive && <span className={s.check}>✓</span>}
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

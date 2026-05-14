'use client';

import { useTranslation } from 'react-i18next';
import s from './RoleSelector.module.scss';
import roles from '@/utils/roles.js';

export default function RoleSelector({
  values = [],
  onChange,
  label,
  error,
  max = 3,
  slotsMode = false,
  minPerSlot = 1,
  maxPerSlot = 20,
}) {
  const { t } = useTranslation(['roles']);

  const hasLimit = Number.isFinite(max) && max > 0;

  const isActive = (role) =>
    slotsMode ? values.some((v) => v.role === role) : values.includes(role);

  const getRequired = (role) =>
    slotsMode ? (values.find((v) => v.role === role)?.required ?? 0) : 0;

  const totalSelected = values.length;
  const limitReached = hasLimit && totalSelected >= max;

  const toggleRole = (role) => {
    if (slotsMode) {
      if (isActive(role)) {
        onChange(values.filter((v) => v.role !== role));
        return;
      }
      if (limitReached) return;
      onChange([...values, { role, required: minPerSlot }]);
    } else {
      if (values.includes(role)) {
        onChange(values.filter((r) => r !== role));
        return;
      }
      if (limitReached) return;
      onChange([...values, role]);
    }
  };

  const changeRequired = (role, delta) => {
    if (!slotsMode) return;
    onChange(
      values.map((v) =>
        v.role === role
          ? {
              ...v,
              required: Math.min(
                maxPerSlot,
                Math.max(minPerSlot, (v.required || minPerSlot) + delta)
              ),
            }
          : v
      )
    );
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        {label && <label className={s.label}>{label}</label>}
        {hasLimit ? (
          <span
            className={`${s.counter} ${limitReached ? s.counterLimit : ''}`}
          >
            {totalSelected} / {max}
          </span>
        ) : (
          <span className={s.counter}>{totalSelected}</span>
        )}
      </div>

      <div className={s.roleGrid}>
        {roles.map((role) => {
          const active = isActive(role);
          const disabled = !active && limitReached;
          const required = getRequired(role);

          return (
            <div key={role} className={s.roleItem}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleRole(role)}
                className={`${s.roleCard} ${active ? s.active : ''} ${disabled ? s.disabled : ''}`}
              >
                <span className={s.text}>{t(role)}</span>
                <span className={s.check}>✓</span>
              </button>

              {slotsMode && active && (
                <div className={s.stepper}>
                  <button
                    type="button"
                    className={s.stepBtn}
                    onClick={() => changeRequired(role, -1)}
                    disabled={required <= minPerSlot}
                    aria-label="Уменьшить"
                  >
                    −
                  </button>
                  <span className={s.stepValue}>{required}</span>
                  <button
                    type="button"
                    className={s.stepBtn}
                    onClick={() => changeRequired(role, +1)}
                    disabled={required >= maxPerSlot}
                    aria-label="Увеличить"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={`${s.message} ${error ? s.errorVisible : ''}`}>
        {error}
      </div>
    </div>
  );
}

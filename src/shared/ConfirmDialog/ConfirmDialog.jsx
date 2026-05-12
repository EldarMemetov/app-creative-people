'use client';
import React from 'react';
import Modal from '@/shared/Modal/Modal';
import s from './ConfirmDialog.module.scss';

export default function ConfirmDialog({
  show,
  variant = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Отмена',
  onConfirm,
  onClose,
  loading = false,
}) {
  const isConfirm = variant === 'confirm';

  return (
    <Modal show={show} onClose={onClose} contentClassName={s.dialog}>
      <div className={s.inner}>
        <div className={`${s.icon} ${s[`icon_${variant}`]}`} aria-hidden>
          {variant === 'error' ? '!' : variant === 'confirm' ? '?' : 'i'}
        </div>

        {title && <h3 className={s.title}>{title}</h3>}
        {message && <p className={s.message}>{message}</p>}

        <div className={s.actions}>
          {isConfirm && (
            <button
              type="button"
              className={s.btnGhost}
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className={`${s.btnPrimary} ${variant === 'error' ? s.btnDanger : ''}`}
            onClick={isConfirm ? onConfirm : onClose}
            disabled={loading}
          >
            {loading ? 'Подождите…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

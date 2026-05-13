'use client';
import React from 'react';
import Modal from '@/shared/Modal/Modal';
import styles from './ConfirmModal.module.scss';

export default function ConfirmModal({
  show,
  message = '',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      show={show}
      onClose={onCancel}
      contentClassName={styles.confirmModal}
    >
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import React from 'react';
import s from './PortfolioManager.module.scss';

export default function UploadZone({
  inputRef,
  dragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  openFileDialog,
  handleInputChange,
  limits,
  remaining,
  disabled,
}) {
  if (!limits) return null;

  const allowMultiple = limits.count > 1 && remaining > 1;
  const isFull = remaining <= 0;

  return (
    <div
      className={`${s.uploadZone} ${dragOver ? s.dragOver : ''} ${
        isFull || disabled ? s.uploadZoneDisabled : ''
      }`}
      onDrop={isFull || disabled ? undefined : onDrop}
      onDragOver={isFull || disabled ? undefined : onDragOver}
      onDragLeave={onDragLeave}
      onClick={isFull || disabled ? undefined : openFileDialog}
      role="button"
      tabIndex={isFull || disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isFull && !disabled) {
          openFileDialog();
        }
      }}
      aria-label="Добавить файлы в портфолио"
      aria-disabled={isFull || disabled}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={allowMultiple}
        accept={limits.accept}
        className={s.fileInput}
        onChange={handleInputChange}
        disabled={isFull || disabled}
      />
      <div className={s.uploadContent}>
        <div className={s.uploadTitle}>
          {isFull ? 'Лимит достигнут' : `Добавить: ${limits.label}`}
        </div>
        <div className={s.uploadHint}>
          {isFull
            ? 'Удалите файл, чтобы освободить место'
            : `Перетащите ${
                limits.kind === 'video' ? 'видео' : 'фото'
              } или нажмите для выбора · осталось мест: ${remaining}`}
        </div>
      </div>
    </div>
  );
}

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
}) {
  return (
    <div
      className={`${s.uploadZone} ${dragOver ? s.dragOver : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={openFileDialog}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openFileDialog();
      }}
      aria-label="Добавить файлы в портфолио"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className={s.fileInput}
        onChange={handleInputChange}
      />
      <div className={s.uploadContent}>
        <div className={s.uploadTitle}>Добавить в портфолио</div>
        <div className={s.uploadHint}>
          Перетащите файлы или нажмите для выбора (до 10 файлов за загрузку)
        </div>
      </div>
    </div>
  );
}

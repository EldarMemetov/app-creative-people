'use client';

import React from 'react';
import { usePortfolioManager } from './usePortfolioManager';
import UploadZone from './UploadZone';
import UploadQueue from './UploadQueue';
import PortfolioGrid from './PortfolioGrid';
import s from './PortfolioManager.module.scss';

export default function PortfolioManager({
  initialPortfolio = [],
  refreshUser,
}) {
  const {
    items,
    uploadQueue,
    dragOver,
    inputRef,
    onFilesSelected,
    handleInputChange,
    handleDelete,
    onDrop,
    onDragOver,
    onDragLeave,
    openFileDialog,
    errors,
  } = usePortfolioManager({ initialPortfolio, refreshUser });

  return (
    <div className={s.wrapper}>
      <UploadZone
        inputRef={inputRef}
        dragOver={dragOver}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        openFileDialog={openFileDialog}
        handleInputChange={handleInputChange}
      />

      {errors && errors.length > 0 && (
        <div className={s.errors}>
          {errors.map((m, i) => (
            <div key={i} className={s.errorItem}>
              {m}
            </div>
          ))}
        </div>
      )}

      <UploadQueue uploadQueue={uploadQueue} />

      <PortfolioGrid items={items} onDelete={handleDelete} />
    </div>
  );
}

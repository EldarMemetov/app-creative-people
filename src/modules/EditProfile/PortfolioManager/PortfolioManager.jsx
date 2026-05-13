'use client';

import React from 'react';
import { usePortfolioManager } from './usePortfolioManager';
import HeroModeSelector from './HeroModeSelector';
import UploadZone from './UploadZone';
import UploadQueue from './UploadQueue';
import PortfolioGrid from './PortfolioGrid';
import ConfirmModal from './ConfirmModal/ConfirmModal';
import s from './PortfolioManager.module.scss';

export default function PortfolioManager({
  initialHeroType = null,
  initialHeroMedia = [],
  refreshUser,
}) {
  const {
    heroType,
    items,
    uploadQueue,
    dragOver,
    errors,
    busy,
    inputRef,
    limits,
    remaining,
    changeMode,
    clearAll,
    handleInputChange,
    handleDelete,
    onDrop,
    onDragOver,
    onDragLeave,
    openFileDialog,
    confirmProps,
  } = usePortfolioManager({
    initialHeroType,
    initialHeroMedia,
    refreshUser,
  });

  return (
    <div className={s.wrapper}>
      <HeroModeSelector
        heroType={heroType}
        onChange={changeMode}
        onClear={clearAll}
        busy={busy}
        hasMedia={items.length > 0}
      />

      {heroType && (
        <UploadZone
          inputRef={inputRef}
          dragOver={dragOver}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          openFileDialog={openFileDialog}
          handleInputChange={handleInputChange}
          limits={limits}
          remaining={remaining}
          disabled={busy}
        />
      )}

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

      <ConfirmModal {...confirmProps} />
    </div>
  );
}

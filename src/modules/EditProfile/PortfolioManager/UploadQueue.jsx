'use client';

import React from 'react';
import s from './PortfolioManager.module.scss';

export default function UploadQueue({ uploadQueue }) {
  if (!uploadQueue || uploadQueue.length === 0) return null;

  return (
    <div className={s.queue}>
      {uploadQueue.map((u) => (
        <div key={u.id} className={s.uploadItem}>
          <div className={s.uploadName}>{u.file.name}</div>
          <div className={s.progressWrap}>
            <div
              className={s.progressBar}
              style={{ width: `${u.progress}%` }}
            />
            <div className={s.progressLabel}>
              {u.status === 'uploading' && `${u.progress}%`}
              {u.status === 'queued' && 'Ожидание'}
              {u.status === 'done' && 'Готово'}
              {u.status === 'error' && 'Ошибка'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

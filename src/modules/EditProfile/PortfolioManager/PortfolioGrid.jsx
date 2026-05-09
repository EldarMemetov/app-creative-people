'use client';

import React from 'react';
import Image from 'next/image';
import s from './PortfolioManager.module.scss';

export default function PortfolioGrid({ items = [], onDelete }) {
  if (!items || items.length === 0) {
    return <div className={s.empty}>Файлов пока нет</div>;
  }

  const renderPreview = (item) => {
    if (item.type === 'video') {
      return (
        <>
          <video className={s.video} src={item.url} muted playsInline />
          <div className={s.playIcon} aria-hidden />
        </>
      );
    }
    return (
      <Image
        width={300}
        height={300}
        className={s.image}
        src={item.url}
        alt="portfolio"
        unoptimized
      />
    );
  };

  return (
    <div className={s.grid}>
      {items.map((it) => (
        <div className={s.card} key={it._id}>
          <div className={s.preview}>{renderPreview(it)}</div>

          <div className={s.cardBody}>
            <div className={s.cardInfo}>
              <div className={s.typeBadge}>
                {it.type === 'video' ? 'Видео' : 'Фото'}
              </div>
            </div>

            <div className={s.cardActions}>
              <button
                type="button"
                className={s.deleteBtn}
                onClick={() => onDelete?.(it._id)}
                aria-label={`Удалить элемент портфолио ${it._id}`}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

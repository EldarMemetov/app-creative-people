'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import s from './PortfolioModal.module.scss';

export default function PortfolioModal({ items, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i < items.length - 1 ? i + 1 : i));
  }, [items.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  const item = items[index];

  if (!item) return null;

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>
          ✕
        </button>

        {index > 0 && (
          <button className={s.navLeft} onClick={prev}>
            ‹
          </button>
        )}

        {index < items.length - 1 && (
          <button className={s.navRight} onClick={next}>
            ›
          </button>
        )}

        <div className={s.content}>
          {item.type === 'photo' ? (
            <ImageWithFallback
              src={item.url}
              alt="portfolio"
              width={900}
              height={900}
              className={s.media}
            />
          ) : (
            <video src={item.url} controls autoPlay className={s.media} />
          )}
        </div>
      </div>
    </div>
  );
}

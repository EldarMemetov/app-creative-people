'use client';

import React, { useState } from 'react';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import PortfolioModal from '../PortfolioModal/PortfolioModal';
import s from './PortfolioList.module.scss';

export default function PortfolioList({ items = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!items.length) {
    return <div className={s.empty}>Портфоліо пусто</div>;
  }

  return (
    <>
      <div className={s.portfolio}>
        <div className={s.title}>Портфоліо</div>

        <ul className={s.grid}>
          {items.map((item, index) => (
            <li
              key={item._id ?? index}
              className={s.card}
              onClick={() => setActiveIndex(index)}
            >
              {item.type === 'photo' ? (
                <ImageWithFallback
                  className={s.media}
                  src={item.url}
                  alt="portfolio"
                  width={300}
                  height={300}
                />
              ) : (
                <>
                  <video className={s.media} src={item.url} muted />
                  <div className={s.videoIcon}>▶</div>
                </>
              )}

              <div className={s.hoverOverlay} />
            </li>
          ))}
        </ul>
      </div>

      {activeIndex !== null && (
        <PortfolioModal
          items={items}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}

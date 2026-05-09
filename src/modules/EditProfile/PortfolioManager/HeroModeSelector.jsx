'use client';

import React from 'react';
import s from './PortfolioManager.module.scss';
import { HERO_LIMITS } from './constants';

const MODES = [
  { key: 'showreel', title: 'Шоурил', desc: '1 видео до 100 МБ' },
  { key: 'slideshow', title: 'Слайдшоу', desc: 'До 5 фото по 5 МБ' },
  { key: 'cover', title: 'Баннер', desc: '1 фото до 5 МБ' },
];

export default function HeroModeSelector({
  heroType,
  onChange,
  onClear,
  busy,
  hasMedia,
}) {
  return (
    <div className={s.modeSelector}>
      <div className={s.modeHeader}>
        <h3 className={s.modeTitle}>Режим портфолио</h3>
        {(heroType || hasMedia) && (
          <button
            type="button"
            className={s.clearBtn}
            onClick={onClear}
            disabled={busy}
            aria-label="Очистить портфолио"
          >
            Очистить всё
          </button>
        )}
      </div>

      <div className={s.modeGrid}>
        {MODES.map((m) => {
          const active = heroType === m.key;
          return (
            <button
              key={m.key}
              type="button"
              className={`${s.modeCard} ${active ? s.modeCardActive : ''}`}
              onClick={() => onChange(m.key)}
              disabled={busy}
              aria-pressed={active}
            >
              <div className={s.modeCardTitle}>{m.title}</div>
              <div className={s.modeCardDesc}>{m.desc}</div>
              <div className={s.modeCardMeta}>
                Лимит: {HERO_LIMITS[m.key].count} файл(ов)
              </div>
            </button>
          );
        })}
      </div>

      {!heroType && (
        <div className={s.modeHint}>
          Выберите режим, чтобы начать загрузку файлов
        </div>
      )}
    </div>
  );
}

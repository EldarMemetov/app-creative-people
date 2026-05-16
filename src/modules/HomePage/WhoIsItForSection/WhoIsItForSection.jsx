'use client';

import { useRef, useCallback } from 'react';
import Container from '@/shared/container/Container';
import s from './WhoIsItForSection.module.scss';
import Icon from '@/shared/Icon/Icon';
import { useTranslation } from 'react-i18next';

export default function WhoIsItForSection() {
  const { t } = useTranslation(['whoIsItFor']);
  const trackRef = useRef(null);
  const currentIndexRef = useRef(0);
  const isScrollingRef = useRef(false);

  const cards = t('cards', { returnObjects: true });

  const getCardWidth = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 256;
    const card = el.querySelector('li');
    if (!card) return 256;
    const gap = parseFloat(getComputedStyle(el).gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }, []);

  const scrollToIndex = useCallback(
    (index) => {
      const el = trackRef.current;
      if (!el || isScrollingRef.current) return;

      const clamped = Math.max(0, Math.min(index, cards.length - 1));
      currentIndexRef.current = clamped;

      const cardW = getCardWidth();
      isScrollingRef.current = true;

      el.scrollTo({ left: clamped * cardW, behavior: 'smooth' });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    },
    [getCardWidth, cards.length]
  );

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = getCardWidth();
    currentIndexRef.current = Math.round(el.scrollLeft / cardW);
  }, [getCardWidth]);

  return (
    <section className={s.section}>
      <Container>
        <header className={s.header}>
          <div className={s.headerTop}>
            <span className={s.eyebrow}>
              <span className={s.dot} />
              {t('eyebrow')}
            </span>
          </div>

          <h2 className={s.title}>
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h2>

          <p className={s.subtitle}>{t('subtitle')}</p>
        </header>
      </Container>

      <div className={s.sliderWrap}>
        <ul ref={trackRef} className={s.list} onScroll={handleScroll}>
          {cards.map((card, i) => (
            <li
              key={card.title}
              className={s.card}
              style={{ '--delay': `${0.1 + i * 0.08}s` }}
            >
              <div className={s.frame}>
                <div
                  className={s.image}
                  style={{ backgroundImage: `url(${card.image})` }}
                />
                <div className={s.imageOverlay} />
                <div className={s.shutter} />
                <div className={s.frameBorder} />
                <span className={s.index}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={s.tag}>
                  <span className={s.tagDot} />
                  REC
                </span>
              </div>

              <div className={s.body}>
                <h3 className={s.cardTitle}>{card.title}</h3>
                <p className={s.cardText}>{card.description}</p>
                <span className={s.line} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={s.controls}>
        <button
          type="button"
          className={s.arrow}
          aria-label={t('prevAriaLabel')}
          onClick={() => scrollToIndex(currentIndexRef.current - 1)}
        >
          <Icon
            iconName="icon-next-go"
            className={s.storeIcon}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className={s.arrow}
          aria-label={t('nextAriaLabel')}
          onClick={() => scrollToIndex(currentIndexRef.current + 1)}
        >
          <Icon
            iconName="icon-next"
            className={s.storeIcon}
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}

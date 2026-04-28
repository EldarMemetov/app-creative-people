'use client';

import { useRef, useCallback } from 'react';
import Container from '@/shared/container/Container';
import s from './WhoIsItForSection.module.scss';

const cards = [
  {
    title: 'Фотографи',
    description: 'Знаходь моделей та клієнтів для зйомок, розширюй клієнтуру.',
    image: '/image/card.png',
  },
  {
    title: 'Моделі',
    description: 'Отримуй запрошення на зйомки, розширюй портфоліо.',
    image: '/image/card.png',
  },
  {
    title: 'Відеографи / Режисери',
    description: 'Збирай команду для кліпів, реклами чи контенту.',
    image: '/image/card.png',
  },
  {
    title: 'Продюсери',
    description: 'Координуй проєкти, знаходь підрядників та керуй командою.',
    image: '/image/card.png',
  },
  {
    title: 'Ретушери',
    description:
      'Пропонуй свої послуги фотографам та агентствам, знаходь постійних клієнтів.',
    image: '/image/card.png',
  },
  {
    title: 'Візажисти / Стилісти / Перукарі',
    description: "Створюй образи, працюй із командами та просувай своє ім'я.",
    image: '/image/card.png',
  },
  {
    title: 'Дизайнери одягу',
    description: 'Просувай колекції, знаходь моделей та знімальні команди.',
    image: '/image/card.png',
  },
  {
    title: 'Бізнес / Бренди / Агентства',
    description: 'Шукай креативні команди для реклами, контенту та промо.',
    image: '/image/card.png',
  },
  {
    title: 'AI-креатори',
    description:
      'Створюй фото і відео за допомогою ШІ, ділись роботами та знаходь колег.',
    image: '/image/card.png',
  },
];

export default function WhoIsItForSection() {
  const trackRef = useRef(null);
  const currentIndexRef = useRef(0);
  const isScrollingRef = useRef(false);

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
    [getCardWidth]
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
              Для кого платформа
            </span>
          </div>

          <h2 className={s.title}>
            Простір, де творці
            <br />
            знаходять одне одного
          </h2>

          <p className={s.subtitle}>
            Незалежно від того, хто ти — професіонал зі стажем чи лише шукаєш
            свою команду — тут є місце для тебе. Обери свою роль.
          </p>
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
          aria-label="Попередня"
          onClick={() => scrollToIndex(currentIndexRef.current - 1)}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              d="M15 5l-7 7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={s.arrow}
          aria-label="Наступна"
          onClick={() => scrollToIndex(currentIndexRef.current + 1)}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

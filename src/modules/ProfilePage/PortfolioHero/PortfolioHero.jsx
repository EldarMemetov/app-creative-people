'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import s from './PortfolioHero.module.scss';

const SLIDESHOW_INTERVAL = 5000;

export default function PortfolioHero({ heroType, heroMedia = [] }) {
  if (!heroType || !heroMedia?.length) return null;
  if (heroType === 'cover') return <CoverHero item={heroMedia[0]} />;
  if (heroType === 'showreel') return <ShowreelHero item={heroMedia[0]} />;
  if (heroType === 'slideshow') return <SlideshowHero items={heroMedia} />;
  return null;
}

function CoverHero({ item }) {
  return (
    <div className={`${s.hero} ${s.heroBanner}`}>
      <div className={s.stage}>
        <Image
          fill
          priority
          sizes="100vw"
          className={`${s.media} ${s.mediaContain}`}
          src={item.url}
          alt="cover"
        />
      </div>
    </div>
  );
}

function ShowreelHero({ item }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  return (
    <div
      className={`${s.hero} ${s.heroVideo}`}
      onClick={togglePlay}
      style={{ cursor: 'pointer' }}
    >
      <div className={s.stage}>
        <video
          ref={videoRef}
          className={s.media}
          src={item.url}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => {
            setReady(true);
            setPlaying(true);
          }}
          style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />
        {!playing && ready && (
          <div className={s.playOverlay} aria-hidden>
            ▶
          </div>
        )}
      </div>
    </div>
  );
}

function SlideshowHero({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % total),
      SLIDESHOW_INTERVAL
    );
    return () => clearInterval(t);
  }, [paused, total]);

  const go = (next) => setIndex(((next % total) + total) % total);

  return (
    <div
      className={`${s.hero} ${s.heroSlideshow}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={s.stage}>
        {items.map((it, i) => (
          <Image
            key={it._id || it.url}
            fill
            sizes="100vw"
            priority={i === 0}
            src={it.url}
            alt={`Слайд ${i + 1}`}
            className={`${s.media} ${s.mediaContain} ${s.slide} ${
              i === index ? s.slideActive : ''
            }`}
            aria-hidden={i !== index}
          />
        ))}

        {total > 1 && (
          <>
            <button
              type="button"
              className={`${s.arrow} ${s.arrowLeft}`}
              onClick={() => go(index - 1)}
              aria-label="Попередній"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${s.arrow} ${s.arrowRight}`}
              onClick={() => go(index + 1)}
              aria-label="Наступний"
            >
              ›
            </button>
            <div className={s.dots}>
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${s.dot} ${i === index ? s.dotActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

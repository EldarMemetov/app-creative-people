'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import s from './PortfolioHero.module.scss';
import Image from 'next/image';

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
    <div className={s.hero}>
      <Image
        fill
        priority
        sizes="100vw"
        className={`${s.media} ${s.kenBurns}`}
        src={item.url}
        alt="cover"
      />
      <div className={s.gradient} />
    </div>
  );
}

function ShowreelHero({ item }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

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

  const toggleMute = useCallback((e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  return (
    <div className={s.hero} onClick={togglePlay}>
      <video
        ref={videoRef}
        className={s.media}
        src={item.url}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className={s.gradient} />
      <button
        type="button"
        className={s.muteBtn}
        onClick={toggleMute}
        aria-label={muted ? 'Включить звук' : 'Выключить звук'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {!playing && (
        <div className={s.playOverlay} aria-hidden>
          ▶
        </div>
      )}
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
      className={s.hero}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((it, i) => (
        <Image
          key={it._id || it.url}
          fill
          sizes="100vw"
          priority={i === 0}
          src={it.url}
          alt={`slide ${i + 1}`}
          className={`${s.media} ${s.slide} ${i === index ? s.slideActive : ''} ${s.kenBurns}`}
          aria-hidden={i !== index}
        />
      ))}

      <div className={s.gradient} />

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${s.arrow} ${s.arrowLeft}`}
            onClick={() => go(index - 1)}
            aria-label="Предыдущее"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${s.arrow} ${s.arrowRight}`}
            onClick={() => go(index + 1)}
            aria-label="Следующее"
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
  );
}

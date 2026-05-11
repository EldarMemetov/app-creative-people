'use client';

import { useEffect, useState } from 'react';
import Container from '@/shared/container/Container';
import { getAllUsers } from '@/services/api/users/api';
import { ROUTES, LINKDATA } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import Modal from '@/shared/Modal/Modal';
import s from './JoinNow.module.scss';

const TARGET = 1000;

export default function JoinNow() {
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [progress, setProgress] = useState(0);

  // ── разделили видимость и контент ──
  const [comingPlatform, setComingPlatform] = useState(null); // 'ios' | 'android' | null
  const [isComingOpen, setIsComingOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const users = await getAllUsers();
        if (!mounted) return;
        setCount(Array.isArray(users) ? users.length : 0);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const target = Math.min(count, TARGET);
    const duration = 1600;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayCount(Math.round(target * eased));
      setProgress((target / TARGET) * 100 * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  const handleOpenComing = (platform) => {
    setComingPlatform(platform);
    setIsComingOpen(true);
  };

  const handleCloseComing = () => {
    setIsComingOpen(false);
  };

  const handleAfterClose = () => {
    setComingPlatform(null);
  };

  const isIos = comingPlatform === 'ios';
  const isAndroid = comingPlatform === 'android';

  return (
    <section className={s.section}>
      <Container>
        <div className={s.shell}>
          <div className={s.shellBorder} />

          <header className={s.header}>
            <span className={s.eyebrow}>
              <span className={s.dot} />
              Приєднатися зараз
            </span>
            <h2 className={s.title}>Місце, де народжуються колаборації</h2>
            <p className={s.subtitle}>
              Обєднуйся з творчими людьми, знаходь проєкти і будуй репутацію у
              спільноті, яка зростає.
            </p>
          </header>

          <div className={s.progress}>
            <div className={s.counter}>
              <span className={s.counterValue}>{displayCount}</span>
              <span className={s.counterTotal}>/ {TARGET} учасників</span>
            </div>
            <div className={s.bar}>
              <span className={s.barFill} style={{ width: `${progress}%` }}>
                <span className={s.barShine} />
              </span>
              <span className={s.barTicks} />
            </div>
            <p className={s.hint}>
              Допоможи нам дійти до запуску — будь серед перших.
            </p>
          </div>

          <div className={s.actions}>
            <LinkButton
              className={s.primary}
              path={ROUTES.REGISTER}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText="Реєстрація"
            />
            <LinkButton
              className={s.secondary}
              path={ROUTES.LOGIN}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText="Увійти"
            />
          </div>

          <div className={s.stores}>
            <button
              type="button"
              className={s.store}
              aria-label="App Store"
              onClick={() => handleOpenComing('ios')}
            >
              <svg
                className={s.storeIcon}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M16.365 1.43c0 1.14-.45 2.22-1.18 3.01-.78.85-2.05 1.5-3.07 1.42-.13-1.1.43-2.27 1.13-3.02.78-.83 2.13-1.45 3.12-1.41zM20.5 17.16c-.6 1.39-.89 2-1.66 3.23-1.07 1.71-2.58 3.84-4.45 3.86-1.66.02-2.09-1.08-4.34-1.07-2.25.01-2.72 1.09-4.39 1.07-1.87-.02-3.3-1.95-4.37-3.66-2.99-4.78-3.31-10.39-1.46-13.37 1.31-2.11 3.39-3.34 5.34-3.34 1.99 0 3.24 1.09 4.88 1.09 1.6 0 2.57-1.09 4.87-1.09 1.74 0 3.58.95 4.89 2.59-4.3 2.36-3.6 8.5.69 10.69z" />
              </svg>
              <span className={s.storeText}>
                <span className={s.storeSmall}>Завантажити в</span>
                <span className={s.storeName}>App Store</span>
              </span>
            </button>

            <button
              type="button"
              className={s.store}
              aria-label="Google Play"
              onClick={() => handleOpenComing('android')}
            >
              <svg
                className={s.storeIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="gp1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a6b4ff" />
                    <stop offset="100%" stopColor="#7a5bff" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#gp1)"
                  d="M3.6 1.6c-.4.3-.6.8-.6 1.4v18c0 .6.2 1.1.6 1.4l10.5-10.4L3.6 1.6zm12 9.4l3.4-3.4-12-7c-.2-.1-.5-.2-.8-.2l9.4 10.6zm0 1.8l-9.4 10.6c.3 0 .5-.1.8-.2l12-7-3.4-3.4zm5.5-3.2l-2.6-1.5-3.7 3.7 3.7 3.7 2.6-1.5c1.3-.7 1.3-2.7 0-3.4z"
                />
              </svg>
              <span className={s.storeText}>
                <span className={s.storeSmall}>Завантажити в</span>
                <span className={s.storeName}>Google Play</span>
              </span>
            </button>
          </div>

          <ul className={s.guarantees}>
            <li className={s.guarantee}>
              <span className={s.check}>✓</span>
              Безкоштовна реєстрація
            </li>
            <li className={s.guarantee}>
              <span className={s.check}>✓</span>
              Без прихованих платежів
            </li>
            <li className={s.guarantee}>
              <span className={s.check}>✓</span>
              Вийти можна будь-коли
            </li>
          </ul>
        </div>
      </Container>

      <Modal
        show={isComingOpen}
        onClose={handleCloseComing}
        onAfterClose={handleAfterClose}
        contentClassName={s.comingModal}
      >
        <div className={s.comingInner}>
          <div className={s.comingBadge}>
            <span className={s.comingBadgeDot} />
            Скоро
          </div>

          <div className={s.comingIcon}>
            <span className={s.comingIconGlow} />
            <span className={s.comingIconCore}>
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                aria-hidden="true"
              >
                {isIos && (
                  <path
                    fill="currentColor"
                    d="M16.365 1.43c0 1.14-.45 2.22-1.18 3.01-.78.85-2.05 1.5-3.07 1.42-.13-1.1.43-2.27 1.13-3.02.78-.83 2.13-1.45 3.12-1.41zM20.5 17.16c-.6 1.39-.89 2-1.66 3.23-1.07 1.71-2.58 3.84-4.45 3.86-1.66.02-2.09-1.08-4.34-1.07-2.25.01-2.72 1.09-4.39 1.07-1.87-.02-3.3-1.95-4.37-3.66-2.99-4.78-3.31-10.39-1.46-13.37 1.31-2.11 3.39-3.34 5.34-3.34 1.99 0 3.24 1.09 4.88 1.09 1.6 0 2.57-1.09 4.87-1.09 1.74 0 3.58.95 4.89 2.59-4.3 2.36-3.6 8.5.69 10.69z"
                  />
                )}
                {isAndroid && (
                  <path
                    fill="currentColor"
                    d="M3.6 1.6c-.4.3-.6.8-.6 1.4v18c0 .6.2 1.1.6 1.4l10.5-10.4L3.6 1.6zm12 9.4l3.4-3.4-12-7c-.2-.1-.5-.2-.8-.2l9.4 10.6zm0 1.8l-9.4 10.6c.3 0 .5-.1.8-.2l12-7-3.4-3.4zm5.5-3.2l-2.6-1.5-3.7 3.7 3.7 3.7 2.6-1.5c1.3-.7 1.3-2.7 0-3.4z"
                  />
                )}
              </svg>
            </span>
          </div>

          <h3 className={s.comingTitle}>
            {isIos && 'Додаток для iOS — в розробці'}
            {isAndroid && 'Додаток для Android — в розробці'}
          </h3>

          <p className={s.comingText}>
            Ми вже працюємо над мобільним додатком QVRIX — щоб ти міг знаходити
            команду й вести проєкти прямо з телефону. Скоро він з&apos;явиться у{' '}
            <strong>
              {isIos && 'App Store'}
              {isAndroid && 'Google Play'}
            </strong>
            . А поки що — користуйся вебверсією, тут є все необхідне.
          </p>

          <div className={s.comingActions}>
            <button
              type="button"
              className={s.comingPrimary}
              onClick={handleCloseComing}
            >
              Зрозуміло
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

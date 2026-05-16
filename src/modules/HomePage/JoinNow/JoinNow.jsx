'use client';

import { useEffect, useState } from 'react';
import Container from '@/shared/container/Container';
import { getAllUsers } from '@/services/api/users/api';
import { ROUTES, LINKDATA } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import Modal from '@/shared/Modal/Modal';
import s from './JoinNow.module.scss';
import Icon from '@/shared/Icon/Icon';
import { useTranslation } from 'react-i18next';

const TARGET = 1000;

export default function JoinNow() {
  const { t } = useTranslation(['joinNow']);
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const [comingPlatform, setComingPlatform] = useState(null);
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
              {t('eyebrow')}
            </span>
            <h2 className={s.title}>{t('title')}</h2>
            <p className={s.subtitle}>{t('subtitle')}</p>
          </header>

          <div className={s.progress}>
            <div className={s.counter}>
              <span className={s.counterValue}>{displayCount}</span>
              <span className={s.counterTotal}>
                / {TARGET} {t('counterSuffix')}
              </span>
            </div>
            <div className={s.bar}>
              <span className={s.barFill} style={{ width: `${progress}%` }}>
                <span className={s.barShine} />
              </span>
              <span className={s.barTicks} />
            </div>
            <p className={s.hint}>{t('hint')}</p>
          </div>

          <div className={s.actions}>
            <LinkButton
              className={s.primary}
              path={ROUTES.REGISTER}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText={t('register')}
            />
            <LinkButton
              className={s.secondary}
              path={ROUTES.LOGIN}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText={t('login')}
            />
          </div>

          <div className={s.stores}>
            <button
              type="button"
              className={s.store}
              aria-label={t('stores.appStore')}
              onClick={() => handleOpenComing('ios')}
            >
              <Icon
                iconName="icon-apple"
                className={s.storeIcon}
                aria-hidden="true"
              />
              <span className={s.storeText}>
                <span className={s.storeSmall}>{t('stores.iosSmall')}</span>
                <span className={s.storeName}>{t('stores.appStore')}</span>
              </span>
            </button>

            <button
              type="button"
              className={s.store}
              aria-label={t('stores.googlePlay')}
              onClick={() => handleOpenComing('android')}
            >
              <Icon
                iconName="icon-android"
                className={s.storeIcon}
                aria-hidden="true"
              />
              <span className={s.storeText}>
                <span className={s.storeSmall}>{t('stores.androidSmall')}</span>
                <span className={s.storeName}>{t('stores.googlePlay')}</span>
              </span>
            </button>
          </div>

          <ul className={s.guarantees}>
            {t('guarantees', { returnObjects: true }).map((item, i) => (
              <li key={i} className={s.guarantee}>
                <span className={s.check}>✓</span>
                {item}
              </li>
            ))}
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
            {t('coming.badge')}
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
                  <Icon
                    iconName="icon-apple"
                    className={s.storeIcon}
                    aria-hidden="true"
                  />
                )}
                {isAndroid && (
                  <Icon
                    iconName="icon-android"
                    className={s.storeIcon}
                    aria-hidden="true"
                  />
                )}
              </svg>
            </span>
          </div>

          <h3 className={s.comingTitle}>
            {isIos && t('coming.iosTitle')}
            {isAndroid && t('coming.androidTitle')}
          </h3>

          <p className={s.comingText}>
            {t('coming.textBefore')}{' '}
            <strong>
              {isIos && t('stores.appStore')}
              {isAndroid && t('stores.googlePlay')}
            </strong>
            {t('coming.textAfter')}
          </p>

          <div className={s.comingActions}>
            <button
              type="button"
              className={s.comingPrimary}
              onClick={handleCloseComing}
            >
              {t('coming.button')}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Loader from '@/shared/Loader/Loader';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import SocialLinks from '@/shared/SocialLinks/SocialLinks';
import { LINKDATA } from '@/shared/constants';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import { getLikeStatus } from '@/services/api/users/api';

import NotificationsIndicator from '@/modules/NotificationPage/NotificationsIndicator/NotificationsIndicator';
import CompletedProjects from '@/modules/CompletedProjects/CompletedProjects';
import PortfolioList from '../PortfolioList/PortfolioList';

import s from './InfoDetails.module.scss';

export default function InfoDetails() {
  const { user: guardUser, loading } = useAuthGuard();
  const { usersStatus, usersStatusInitialized, likesMap, connected } =
    useSocket();
  const { t } = useTranslation(['roles']);
  const storeUser = useAuth((s) => s.user);
  const user = storeUser ?? guardUser;

  const [likesCount, setLikesCount] = useState(user?.likesCount ?? null);

  useEffect(() => {
    if (!user) {
      setLikesCount(null);
      return;
    }
    if (typeof user.likesCount === 'number') {
      setLikesCount(user.likesCount);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const data = await getLikeStatus(user._id);
        if (!mounted) return;
        setLikesCount(
          typeof data.likesCount === 'number' ? data.likesCount : 0
        );
      } catch {
        if (!mounted) return;
        setLikesCount(0);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const payload = likesMap[String(user._id)];
    if (payload && typeof payload.count === 'number') {
      setLikesCount(payload.count);
    }
  }, [likesMap, user]);

  if (loading) return <Loader />;
  if (!user) return null;

  const userIdKey = String(user._id ?? user.id ?? '');
  const isOnline =
    connected ||
    (usersStatusInitialized
      ? Boolean(usersStatus[userIdKey])
      : Boolean(user.onlineStatus));

  const fullName =
    `${user.name || ''} ${user.surname || ''}`.trim() || 'Без імені';

  return (
    <section className={s.section}>
      <div className={s.infoDetails}>
        <header className={s.pageHeader}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} />
            Особистий кабінет
          </span>
          <h1 className={s.title}>Мій профіль</h1>
        </header>

        {/* HERO: avatar + identity + stats */}
        <div className={s.hero}>
          <div className={s.heroBorder} />

          <div className={s.identity}>
            <div className={s.avatarWrap}>
              <span className={s.avatarOrbit} />
              <span className={s.avatarRing} />
              <ImageWithFallback
                className={s.avatar}
                src={user.photo || '/image/logo.png'}
                alt={fullName}
                width={180}
                height={180}
              />
              <span
                className={`${s.statusBadge} ${
                  isOnline ? s.statusOnline : s.statusOffline
                }`}
              >
                <span className={s.statusDot} />
                {isOnline ? 'Онлайн' : 'Офлайн'}
              </span>
            </div>

            <div className={s.identityText}>
              <h2 className={s.fullName}>{fullName}</h2>

              {user.email && (
                <a href={`mailto:${user.email}`} className={s.emailLink}>
                  {user.email}
                </a>
              )}

              {(user.city || user.country) && (
                <p className={s.location}>
                  {[user.city, user.country].filter(Boolean).join(', ')}
                </p>
              )}

              {user.roles && user.roles.length > 0 && (
                <ul className={s.rolesList} aria-label="Ролі користувача">
                  {user.roles.map((r, idx) => (
                    <li key={idx} className={s.roleItem}>
                      {t(r)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statLabel}>Лайки</span>
              <span className={s.statValue}>
                {likesCount === null ? '…' : likesCount}
              </span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Рейтинг</span>
              <span className={s.statValue}>
                {user.rating !== undefined && user.rating !== null
                  ? user.rating
                  : '—'}
              </span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Досвід</span>
              <span className={s.statValue}>{user.experience || '—'}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Доступ</span>
              <span className={s.statValue}>{user.accessRole || '—'}</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <nav className={s.actions} aria-label="Дії профілю">
          <NotificationsIndicator>
            <LinkButton
              className={s.actionButton}
              path="notification"
              type={LINKDATA.NOTIFICATION}
              linkText="Сповіщення"
            />
          </NotificationsIndicator>

          <LinkButton
            className={s.actionButton}
            path="my-post"
            type={LINKDATA.MYPOST}
            linkText="Мої пости"
          />

          <LinkButton
            className={s.actionButton}
            path="my-applications"
            type={LINKDATA.APPLICATIONS}
            linkText="Мої заявки"
          />

          <CompletedProjects userId={user._id} />
        </nav>

        {/* MAIN INFO CARD */}
        <div className={s.card}>
          <h3 className={s.sectionTitle}>Основна інформація</h3>

          <div className={s.details}>
            <div className={s.detail}>
              <span className={s.label}>Ім’я</span>
              <span className={s.value}>{user.name || 'не вказано'}</span>
            </div>

            <div className={s.detail}>
              <span className={s.label}>Прізвище</span>
              <span className={s.value}>{user.surname || 'не вказано'}</span>
            </div>

            <div className={s.detail}>
              <span className={s.label}>Місто</span>
              <span className={s.value}>{user.city || 'не вказано'}</span>
            </div>

            <div className={s.detail}>
              <span className={s.label}>Країна</span>
              <span className={s.value}>{user.country || 'не вказано'}</span>
            </div>

            <div className={s.detail}>
              <span className={s.label}>Електронна пошта</span>
              <span className={s.value}>{user.email || 'не вказано'}</span>
            </div>

            <div className={s.detail}>
              <span className={s.label}>Рівень доступу</span>
              <span className={s.value}>{user.accessRole || 'не вказано'}</span>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className={s.card}>
          <h3 className={s.sectionTitle}>Про себе</h3>
          <p className={s.about}>{user.aboutMe || 'не вказано'}</p>
        </div>

        {/* DIRECTIONS */}
        <div className={s.card}>
          <h3 className={s.sectionTitle}>Напрямки</h3>
          {user.directions && user.directions.length > 0 ? (
            <ul className={s.directionsList} aria-label="Напрямки користувача">
              {user.directions.map((d, idx) => (
                <li key={idx} className={s.directionItem}>
                  {t(d, { ns: 'directions' })}
                </li>
              ))}
            </ul>
          ) : (
            <p className={s.empty}>не вказано</p>
          )}
        </div>

        {/* STATUS FLAGS */}
        <div className={s.flags}>
          <div
            className={`${s.flag} ${user.isBlocked ? s.flagDanger : s.flagOk}`}
          >
            <span className={s.flagLabel}>Заблокований</span>
            <span className={s.flagValue}>{user.isBlocked ? 'Так' : 'Ні'}</span>
          </div>

          <div
            className={`${s.flag} ${user.needsReview ? s.flagWarn : s.flagOk}`}
          >
            <span className={s.flagLabel}>Потребує перевірки</span>
            <span className={s.flagValue}>
              {user.needsReview ? 'Так' : 'Ні'}
            </span>
          </div>
        </div>

        {/* SOCIAL */}
        <div className={s.card}>
          <h3 className={s.sectionTitle}>Соціальні мережі</h3>
          <SocialLinks socialLinks={user.socialLinks} />
        </div>

        {/* PORTFOLIO */}
        <div className={s.card}>
          <h3 className={s.sectionTitle}>Портфоліо</h3>
          <PortfolioList items={user.portfolio} />
        </div>

        {/* EDIT */}
        <div className={s.editWrap}>
          <LinkButton
            className={s.editButton}
            path="profile/edit"
            type={LINKDATA.TYPE_LIGHT_BORDER}
            linkText="Редагувати свій профіль"
          />
        </div>
      </div>
    </section>
  );
}

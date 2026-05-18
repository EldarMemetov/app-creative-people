'use client';
import s from './UserDetailPage.module.scss';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserById } from '@/services/api/users/api';
import Loader from '@/shared/Loader/Loader';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Container from '@/shared/container/Container';
import { useTranslation } from 'react-i18next';
import { useSocket } from '@/hooks/useSocket';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { LINKDATA, ROUTES } from '@/shared/constants';
import LikeButton from '@/shared/components/LikeButton/LikeButton';
import { useAuth } from '@/services/store/useAuth';
import PortfolioHero from '../ProfilePage/PortfolioHero/PortfolioHero';
import CompletedProjects from '../CompletedProjects/CompletedProjects';
import SocialLinks from '@/shared/SocialLinks/SocialLinks';
import RatingBadge from '@/shared/RatingBadge/RatingBadge';
import Icon from '@/shared/Icon/Icon';

export default function UserDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation(['roles', 'directions']);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { usersStatus, usersStatusInitialized, connected } = useSocket();
  const { user: currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        setError(err.message || 'Помилка при завантаженні користувача');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (authLoading || loading) return <Loader />;
  if (error) return <div className={s.error}>Помилка: {error}</div>;
  if (!user) return <div className={s.noUser}>Користувача не знайдено</div>;

  const userIdKey = String(user._id ?? user.id ?? '');
  const isOwn = currentUser && String(currentUser._id) === userIdKey;

  const getSafePhoto = (url) => {
    if (!url) return '/image/avatar.webp';
    return url.startsWith('https://cdn.sanity.io') ||
      url.startsWith('https://res.cloudinary.com')
      ? url
      : '/image/avatar.webp';
  };

  const isOnline = isOwn
    ? connected ||
      (usersStatusInitialized
        ? Boolean(usersStatus[userIdKey])
        : Boolean(user.onlineStatus))
    : usersStatusInitialized
      ? Boolean(usersStatus[userIdKey])
      : Boolean(user.onlineStatus);

  const rolesArray =
    Array.isArray(user.roles) && user.roles.length
      ? user.roles
      : user.role
        ? [user.role]
        : [];

  const fullName =
    `${user.name || ''} ${user.surname || ''}`.trim() || 'Без імені';
  const location = [user.city, user.country].filter(Boolean).join(', ');
  const likesCountDisplay =
    typeof user.likesCount === 'number' ? user.likesCount : 0;

  return (
    <section className={s.section}>
      {/* 2. Hero медіа — на всю ширину */}
      <PortfolioHero heroType={user.heroType} heroMedia={user.heroMedia} />

      <Container>
        <div className={s.actionsNext}>
          {' '}
          <LinkButton
            path={ROUTES.TALENTS}
            type={LINKDATA.HOME}
            className={s.backButton}
          >
            {' '}
            <Icon
              iconName="icon-left"
              className={s.storeIcon}
              aria-hidden="true"
            />{' '}
            Повернутись до профілів
          </LinkButton>
        </div>

        <div className={s.globalContainer}>
          {/* 3. Header — ім'я і локація */}
          <header className={s.pageHeader}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              Профіль
            </span>
            <h1 className={s.title}>{fullName}</h1>
            {location && <p className={s.subtitle}>{location}</p>}
          </header>

          {/* 4. Hero блок — аватар, ролі, рейтинг, лайк */}
          <div className={s.hero}>
            <div className={s.heroBorder} />

            <div className={s.identity}>
              <div className={s.avatarWrap}>
                <span className={s.avatarOrbit} />
                <span className={s.avatarRing} />
                <ImageWithFallback
                  className={s.avatar}
                  src={getSafePhoto(user.photo)}
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
                {location && <p className={s.location}>{location}</p>}
                {rolesArray.length > 0 && (
                  <ul className={s.rolesList} aria-label="Ролі користувача">
                    {rolesArray.map((r, idx) => (
                      <li key={idx} className={s.roleItem}>
                        {t(r, { ns: 'roles' })}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={s.stats}>
              <RatingBadge rating={user.rating ?? 0} />
            </div>

            <div className={s.actions}>
              {currentUser && !isOwn ? (
                <LikeButton
                  userId={user._id}
                  initialCount={user.likesCount}
                  initialLiked={user.liked}
                />
              ) : (
                !currentUser && (
                  <div className={s.likesReadonly}>
                    <span aria-hidden>♥</span> {likesCountDisplay}
                  </div>
                )
              )}
            </div>
          </div>

          {/* 5. Про себе */}
          <div className={s.card}>
            <h3 className={s.sectionTitle}>Про себе</h3>
            <p className={s.about}>{user.aboutMe || 'не вказано'}</p>
          </div>

          {/* 6. Напрямки */}
          <div className={s.card}>
            <h3 className={s.sectionTitle}>Напрямки</h3>
            {user.directions && user.directions.length > 0 ? (
              <ul
                className={s.directionsList}
                aria-label="Напрямки користувача"
              >
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

          {/* 7. Соціальні мережі */}
          <div className={s.card}>
            <h3 className={s.sectionTitle}>Соціальні мережі</h3>
            <SocialLinks socialLinks={user.socialLinks} />
          </div>

          {/* 8. Завершені проєкти */}
          <CompletedProjects userId={user._id} />
        </div>
      </Container>
    </section>
  );
}

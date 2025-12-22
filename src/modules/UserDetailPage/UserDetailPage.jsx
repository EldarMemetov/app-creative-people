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
import PortfolioList from '../ProfilePage/PortfolioList/PortfolioList';

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

  if (authLoading) return <Loader />;
  if (loading) return <Loader />;
  if (error) return <div>Помилка: {error}</div>;
  if (!user) return <div>Користувача не знайдено</div>;

  const userIdKey = String(user._id ?? user.id ?? '');
  const isOwn = currentUser && String(currentUser._id) === userIdKey;

  const getSafePhoto = (url) => {
    if (!url) return '/image/logo.png';
    return url.startsWith('https://cdn.sanity.io') ||
      url.startsWith('https://res.cloudinary.com')
      ? url
      : '/image/logo.png';
  };

  let isOnline;
  if (isOwn) {
    isOnline =
      connected ||
      (usersStatusInitialized
        ? Boolean(usersStatus[userIdKey])
        : Boolean(user.onlineStatus));
  } else {
    isOnline = usersStatusInitialized
      ? Boolean(usersStatus[userIdKey])
      : Boolean(user.onlineStatus);
  }

  const rolesArray =
    Array.isArray(user.roles) && user.roles.length
      ? user.roles
      : user.role
        ? [user.role]
        : [];

  const directionsTranslated =
    user.directions && user.directions.length
      ? user.directions.map((d) => t(d, { ns: 'directions' })).join(', ')
      : 'не вказано';

  const likesCountDisplay =
    typeof user.likesCount === 'number' ? user.likesCount : 0;

  return (
    <Container>
      <section>
        <h1>Профіль користувача</h1>
        <div>
          <div style={{ flexShrink: 0 }}>
            <ImageWithFallback
              src={getSafePhoto(user.photo)}
              alt={
                `${user.name || ''} ${user.surname || ''}`.trim() || 'Аватар'
              }
              width={160}
              height={160}
            />
          </div>

          <div>
            <p>
              <strong>Ім’я:</strong> {user.name || 'не вказано'}
            </p>
            <p>
              <strong>Прізвище:</strong> {user.surname || 'не вказано'}
            </p>
            <p>
              <strong>Місто:</strong> {user.city || 'не вказано'}
            </p>
            <p>
              <strong>Країна:</strong> {user.country || 'не вказано'}
            </p>
            <p>
              <strong>Email:</strong> {user.email || 'не вказано'}
            </p>

            <div>
              <strong>Ролі:</strong>{' '}
              {rolesArray.length > 0 ? (
                <ul className={s.rolesList} aria-label="Ролі користувача">
                  {rolesArray.map((r, idx) => (
                    <li key={idx} className={s.roleItem}>
                      {t(r)}
                    </li>
                  ))}
                </ul>
              ) : (
                <span>не вказано</span>
              )}
            </div>

            <p>
              <strong>Рівень доступу:</strong> {user.accessRole || 'не вказано'}
            </p>
            <p>
              <strong>Рейтинг:</strong>{' '}
              {user.rating !== undefined && user.rating !== null
                ? user.rating
                : 'не вказано'}
            </p>
            <p>
              <strong>Досвід:</strong> {user.experience || 'не вказано'}
            </p>

            <p>
              <strong>Напрямки:</strong> {directionsTranslated}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: isOnline ? 'green' : 'red',
                }}
              />
              <span>{isOnline ? 'Онлайн' : 'Офлайн'}</span>
            </div>

            {currentUser ? (
              <LikeButton
                userId={user._id}
                initialCount={user.likesCount}
                initialLiked={user.liked}
              />
            ) : (
              <div className={s.likesReadonly}>❤️ {likesCountDisplay}</div>
            )}

            <p>
              <strong>Про себе:</strong> {user.aboutMe || 'не вказано'}
            </p>
            <p>
              <strong>Заблокований:</strong> {user.isBlocked ? 'Так' : 'Ні'}
            </p>

            <PortfolioList items={user.portfolio} />
          </div>

          <LinkButton path={ROUTES.TALENTS} type={LINKDATA.HOME}>
            Повернутись до профілей
          </LinkButton>
        </div>
      </section>
    </Container>
  );
}

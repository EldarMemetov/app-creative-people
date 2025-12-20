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
export default function UserDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation(['roles']);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { usersStatus, usersStatusInitialized } = useSocket();
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
  const isOnline = usersStatusInitialized
    ? Boolean(usersStatus[userIdKey])
    : Boolean(user.onlineStatus);

  const getSafePhoto = (url) => {
    if (!url) return '/image/logo.png';
    return url.startsWith('https://cdn.sanity.io') ||
      url.startsWith('https://res.cloudinary.com')
      ? url
      : '/image/logo.png';
  };

  return (
    <Container>
      <section>
        <h1>Профіль користувача</h1>
        <div>
          <div style={{ flexShrink: 0 }}>
            <ImageWithFallback
              src={getSafePhoto(user.photo)}
              alt={`${user.name} ${user.surname}`}
              width={80}
              height={80}
            />
          </div>

          <div>
            <p>
              <strong>Ім’я:</strong> {user.name}
            </p>
            <p>
              <strong>Прізвище:</strong> {user.surname}
            </p>
            <p>
              <strong>Місто:</strong> {user.city}
            </p>
            <p>
              <strong>Країна:</strong> {user.country}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Роль:</strong> {t(user.role)}
            </p>
            <p>
              <strong>Рівень доступу:</strong> {user.accessRole}
            </p>
            <p>
              <strong>Рейтинг:</strong> {user.rating}
            </p>
            <p>
              <strong>Досвід:</strong> {user.experience || 'не вказано'}
            </p>
            <p>
              <strong>Напрямки:</strong>{' '}
              {user.directions?.length
                ? user.directions.join(', ')
                : 'не вказано'}
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
              <div className={s.likesReadonly}>❤️ {user.likesCount}</div>
            )}

            <p>
              <strong>Про себе:</strong> {user.aboutMe || 'не вказано'}
            </p>
            <p>
              <strong>Заблокований:</strong> {user.isBlocked ? 'Так' : 'Ні'}
            </p>

            {user.portfolio?.length > 0 && (
              <div>
                <strong>Портфоліо:</strong>
                <ul>
                  {user.portfolio.map((item, index) => (
                    <li key={index}>
                      <p>Тип: {item.type === 'photo' ? 'Фото' : 'Відео'}</p>
                      <p>Опис: {item.description || 'немає опису'}</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Переглянути
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <LinkButton path={ROUTES.TALENTS} type={LINKDATA.HOME}>
            Повернутись до профілей
          </LinkButton>
        </div>
      </section>
    </Container>
  );
}

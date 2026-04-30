'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '@/services/api/users/api';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Loader from '@/shared/Loader/Loader';
import Link from 'next/link';
import Container from '@/shared/container/Container';
import s from './UsersPage.module.scss';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { usersStatus, usersStatusInitialized, connected } = useSocket();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { t } = useTranslation(['roles', 'directions']);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();

        const safeUsers = usersData.map((user) => {
          const url = user.photo || '';
          const isAllowedHost =
            url.startsWith('https://cdn.sanity.io') ||
            url.startsWith('https://res.cloudinary.com');

          return {
            ...user,
            safePhoto: isAllowedHost ? url : '/image/logo.png',
          };
        });

        setUsers(safeUsers);
      } catch (err) {
        setError(err.message || 'Помилка при завантаженні користувачів');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading || authLoading) return <Loader />;
  if (error) return <div className={s.error}>Помилка: {error}</div>;
  if (users.length === 0)
    return <div className={s.noUsers}>Немає зареєстрованих користувачів</div>;

  return (
    <Container>
      <section className={s.section}>
        <header className={s.header}>
          <p className={s.eyebrow}>Спільнота</p>
          <h1 className={s.title}>
            Усі <span className={s.accent}>таланти</span>
          </h1>
          <p className={s.subtitle}>
            Знайомся з творчими людьми платформи — знаходь команду, натхнення та
            нові проєкти.
          </p>
          <p className={s.counter}>
            <span className={s.counterDot} />
            {users.length} {users.length === 1 ? 'користувач' : 'користувачів'}{' '}
            у спільноті
          </p>
        </header>

        <div className={s.grid}>
          {users.map((user, idx) => {
            const userIdKey = String(user._id ?? user.id ?? '');
            const isOwn = currentUser && String(currentUser._id) === userIdKey;

            const isOnline = isOwn
              ? Boolean(connected) ||
                (usersStatusInitialized
                  ? Boolean(usersStatus[userIdKey])
                  : Boolean(user.onlineStatus))
              : usersStatusInitialized
                ? Boolean(usersStatus[userIdKey])
                : Boolean(user.onlineStatus);

            const href = isOwn ? '/profile' : `/talents/${user._id}`;

            const rolesArray =
              Array.isArray(user.roles) && user.roles.length
                ? user.roles
                : user.role
                  ? [user.role]
                  : [];

            return (
              <Link
                key={user._id}
                href={href}
                className={s.link}
                style={{ animationDelay: `${Math.min(idx * 0.06, 0.9)}s` }}
              >
                <article className={s.card}>
                  <div className={s.photoWrapper}>
                    <ImageWithFallback
                      src={user.safePhoto}
                      alt={`${user.name} ${user.surname}`}
                      width={500}
                      height={700}
                      className={s.photo}
                    />
                    <div className={s.photoGradient} />

                    <div
                      className={`${s.statusBadge} ${
                        isOnline ? s.statusOnline : s.statusOffline
                      }`}
                    >
                      <span className={s.statusDot} />
                      {isOnline ? 'Онлайн' : 'Офлайн'}
                    </div>
                  </div>

                  <div className={s.infoBlur}>
                    <h2 className={s.name}>
                      {user.name} {user.surname}
                    </h2>

                    {user.city && (
                      <p className={s.infoRow}>
                        <span className={s.label}>Місто</span>
                        <span className={s.value}>{user.city}</span>
                      </p>
                    )}

                    <div className={s.rolesRow}>
                      {rolesArray.length > 0 ? (
                        <ul
                          className={s.rolesList}
                          aria-label="Ролі користувача"
                        >
                          {rolesArray.slice(0, 3).map((r, i) => (
                            <li key={i} className={s.roleItem}>
                              {t(r, { ns: 'roles' })}
                            </li>
                          ))}
                          {rolesArray.length > 3 && (
                            <li className={`${s.roleItem} ${s.roleMore}`}>
                              +{rolesArray.length - 3}
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className={s.value}>не вказано</span>
                      )}
                    </div>
                  </div>

                  <span className={s.hoverGlow} aria-hidden="true" />
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </Container>
  );
}

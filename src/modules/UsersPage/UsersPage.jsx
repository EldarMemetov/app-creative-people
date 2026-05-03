'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { filterUsers } from '@/services/api/users/api';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Loader from '@/shared/Loader/Loader';
import Container from '@/shared/container/Container';
import s from './UsersPage.module.scss';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import FilterUser from '../Filter/FilterUser/FilterUser';

const ALLOWED_HOSTS = ['https://cdn.sanity.io', 'https://res.cloudinary.com'];
const safePhoto = (url = '') =>
  ALLOWED_HOSTS.some((h) => url.startsWith(h)) ? url : '/image/logo.png';

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { usersStatus, usersStatusInitialized, connected } = useSocket();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { t } = useTranslation(['roles', 'directions']);

  const page = Number(searchParams.get('page')) || 1;
  const paramsKey = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const raw = Object.fromEntries(searchParams.entries());
        const directions = searchParams.getAll('directions');
        const params = { ...raw, page, limit: 20 };
        if (directions.length) params.directions = directions.join(',');

        const { items, meta } = await filterUsers(params);
        if (!mounted) return;
        const safe = (items || []).map((u) => ({
          ...u,
          safePhoto: safePhoto(u.photo),
        }));
        setUsers(safe);
        setMeta(meta || { page, limit: 20, total: 0 });
      } catch (err) {
        if (mounted)
          setError(err?.message || 'Помилка при завантаженні користувачів');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, [paramsKey, page, searchParams]);

  const totalPages = Math.max(
    1,
    Math.ceil((meta.total || 0) / (meta.limit || 20))
  );

  const goToPage = (p) => {
    const sp = new URLSearchParams(searchParams);
    sp.set('page', String(p));
    router.replace(`${pathname}?${sp.toString()}`);
  };

  if (authLoading) return <Loader />;
  if (error) return <div className={s.error}>Помилка: {error}</div>;

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
          <FilterUser />
        </header>

        {loading ? (
          <Loader />
        ) : users.length === 0 ? (
          <div className={s.noUsers}>Нікого не знайдено</div>
        ) : (
          <>
            <div className={s.grid}>
              {users.map((user, idx) => {
                const userIdKey = String(user._id ?? user.id ?? '');
                const isOwn =
                  currentUser && String(currentUser._id) === userIdKey;

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
                          className={`${s.statusBadge} ${isOnline ? s.statusOnline : s.statusOffline}`}
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

            {totalPages > 1 && (
              <div className={s.pagination}>
                <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                  ← Назад
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </Container>
  );
}

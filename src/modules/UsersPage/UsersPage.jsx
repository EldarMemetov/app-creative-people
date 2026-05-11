'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { filterUsers } from '@/services/api/users/api';
import { toggleFavorite, getMyFavorites } from '@/services/api/post/api';
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

  // ─── избранное ──────────────────────────────
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const { usersStatus, usersStatusInitialized, connected } = useSocket();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { t } = useTranslation(['roles', 'directions']);

  const page = Number(searchParams.get('page')) || 1;
  const paramsKey = useMemo(() => searchParams.toString(), [searchParams]);

  // загружаем пользователей
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

  // загружаем избранных юзеров (чтобы кнопка-сердечко была сразу в правильном состоянии)
  useEffect(() => {
    if (!currentUser?._id) {
      setFavoriteIds(new Set());
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await getMyFavorites({ type: 'user', page: 1, limit: 100 });
        if (!mounted) return;
        const ids = new Set(
          (res?.data || []).map((u) => String(u._id ?? u.id))
        );
        setFavoriteIds(ids);
      } catch (e) {
        // молча — кнопка просто будет «пустой»
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentUser?._id]);

  const handleToggleFavorite = useCallback(
    async (e, userId) => {
      e.preventDefault();
      e.stopPropagation();

      if (!currentUser?._id) {
        router.push('/auth/login');
        return;
      }
      if (!userId || pendingIds.has(userId)) return;

      // оптимистично переключаем
      setPendingIds((prev) => new Set(prev).add(userId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.has(userId) ? next.delete(userId) : next.add(userId);
        return next;
      });

      try {
        const res = await toggleFavorite({
          targetType: 'user',
          targetId: userId,
        });
        const favorited = res?.data?.favorited;
        // синхронизируем по факту ответа сервера
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          favorited ? next.add(userId) : next.delete(userId);
          return next;
        });
      } catch (err) {
        // откат
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.has(userId) ? next.delete(userId) : next.add(userId);
          return next;
        });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [currentUser?._id, pendingIds, router]
  );

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

                const isFav = favoriteIds.has(userIdKey);
                const isPending = pendingIds.has(userIdKey);

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

                        {/* ─── кнопка избранного ─── */}
                        {!isOwn && (
                          <button
                            type="button"
                            className={`${s.favBtn} ${isFav ? s.favBtnActive : ''}`}
                            onClick={(e) => handleToggleFavorite(e, userIdKey)}
                            disabled={isPending}
                            aria-pressed={isFav}
                            aria-label={
                              isFav ? 'Видалити з обраних' : 'Додати в обрані'
                            }
                            title={
                              isFav ? 'Видалити з обраних' : 'Додати в обрані'
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill={isFav ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        )}
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
              <div
                className={s.pagination}
                role="navigation"
                aria-label="Пагінація"
              >
                <button
                  className={s.buttonStr}
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  aria-label="Попередня сторінка"
                >
                  ← Назад
                </button>
                <span className={s.spanPage} aria-live="polite">
                  {page} / {totalPages}
                </span>
                <button
                  className={s.buttonStr}
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  aria-label="Наступна сторінка"
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

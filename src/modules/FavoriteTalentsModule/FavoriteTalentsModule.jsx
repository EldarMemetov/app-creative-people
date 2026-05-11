'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { toggleFavorite, getMyFavorites } from '@/services/api/post/api';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Loader from '@/shared/Loader/Loader';
import Container from '@/shared/container/Container';
import s from './FavoriteTalentsModule.module.scss';

const ALLOWED_HOSTS = ['https://cdn.sanity.io', 'https://res.cloudinary.com'];
const safePhoto = (url = '') =>
  ALLOWED_HOSTS.some((h) => url.startsWith(h)) ? url : '/image/logo.png';

export default function FavoriteTalentsModule() {
  const { t } = useTranslation(['roles', 'directions']);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingIds, setPendingIds] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getMyFavorites({
          type: 'user',
          page: 1,
          limit: 100,
        });
        if (!mounted) return;
        const safe = (res?.data || []).map((u) => ({
          ...u,
          safePhoto: safePhoto(u.photo),
        }));
        setUsers(safe);
      } catch (err) {
        if (mounted)
          setError(err?.message || 'Помилка при завантаженні обраних');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = useCallback(
    async (e, userId) => {
      e.preventDefault();
      e.stopPropagation();
      if (!userId || pendingIds.has(userId)) return;

      setPendingIds((prev) => new Set(prev).add(userId));
      // оптимистично убираем из списка
      const prevUsers = users;
      setUsers((list) => list.filter((u) => String(u._id) !== userId));

      try {
        await toggleFavorite({ targetType: 'user', targetId: userId });
      } catch (err) {
        // откат
        setUsers(prevUsers);
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [pendingIds, users]
  );

  return (
    <Container>
      <section className={s.section}>
        <header className={s.header}>
          <p className={s.eyebrow}>Моя добірка</p>
          <h1 className={s.title}>
            Обрані <span className={s.accent}>таланти</span>
          </h1>
          <p className={s.subtitle}>
            Тут зібрані люди, яких ти позначив(-ла) серцем — щоб швидко
            повертатись до них.
          </p>
        </header>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className={s.error}>Помилка: {error}</div>
        ) : users.length === 0 ? (
          <div className={s.noUsers}>
            Поки що нікого немає в обраних. Додавай людей серцем зі сторінки{' '}
            <Link href="/talents" className={s.linkInline}>
              «Таланти»
            </Link>
            .
          </div>
        ) : (
          <div className={s.grid}>
            {users.map((user, idx) => {
              const userIdKey = String(user._id);
              const isPending = pendingIds.has(userIdKey);

              const rolesArray =
                Array.isArray(user.roles) && user.roles.length
                  ? user.roles
                  : user.role
                    ? [user.role]
                    : [];

              return (
                <Link
                  key={user._id}
                  href={`/talents/${user._id}`}
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

                      <button
                        type="button"
                        className={`${s.favBtn} ${s.favBtnActive}`}
                        onClick={(e) => handleRemove(e, userIdKey)}
                        disabled={isPending}
                        aria-label="Видалити з обраних"
                        title="Видалити з обраних"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
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
        )}
      </section>
    </Container>
  );
}

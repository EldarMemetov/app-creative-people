'use client';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import { useTranslation } from 'react-i18next';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Loader from '@/shared/Loader/Loader';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { LINKDATA } from '@/shared/constants';
import { useSocket } from '@/hooks/useSocket';
import s from './InfoDetails.module.scss';
import Container from '@/shared/container/Container';
import { getLikeStatus } from '@/services/api/users/api';
import { useEffect, useState } from 'react';
export default function InfoDetails() {
  const { user, loading } = useAuthGuard();
  const { usersStatus, usersStatusInitialized, likesMap, connected } =
    useSocket();
  const { t } = useTranslation(['roles']);

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
      } catch (e) {
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
    if (!payload) return;
    if (typeof payload.count === 'number') {
      setLikesCount(payload.count);
      return;
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
  return (
    <section>
      <Container>
        <div className={s.infoDetails}>
          <h1 className={s.title}>Мій профіль</h1>

          <div className={s.main}>
            <div className={s.avatarWrap}>
              <ImageWithFallback
                className={s.avatar}
                src={user.photo || '/image/logo.png'}
                alt={
                  `${user.name || ''} ${user.surname || ''}`.trim() ||
                  'Аватар користувача'
                }
                width={160}
                height={160}
              />
            </div>

            <div className={s.details}>
              <p className={s.pWithStrong}>
                <strong className={s.label}>Ім’я:</strong>
                <span className={s.value}>{user.name || 'не вказано'}</span>
              </p>
              <p className={s.pWithStrong}>
                <strong className={s.label}>Лайки:</strong>
                <span className={s.value}>
                  {likesCount === null ? '…' : likesCount}
                </span>
              </p>
              <p className={s.pWithStrong}>
                <strong className={s.label}>Прізвище:</strong>
                <span className={s.value}>{user.surname || 'не вказано'}</span>
              </p>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Місто:</strong>
                <span className={s.value}>{user.city || 'не вказано'}</span>
              </p>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Країна:</strong>
                <span className={s.value}>{user.country || 'не вказано'}</span>
              </p>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Електронна пошта:</strong>
                <span className={s.value}>{user.email || 'не вказано'}</span>
              </p>

              <div className={s.row}>
                <span className={s.label}>Ролі</span>
                {user.roles && user.roles.length > 0 ? (
                  <ul className={s.rolesList} aria-label="Ролі користувача">
                    {user.roles.map((r, idx) => (
                      <li key={idx} className={s.roleItem}>
                        {t(r)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={s.value}>не вказано</span>
                )}
              </div>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Рівень доступу:</strong>
                <span className={s.value}>
                  {user.accessRole || 'не вказано'}
                </span>
              </p>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Рейтинг:</strong>
                <span className={s.value}>
                  {user.rating !== undefined && user.rating !== null
                    ? user.rating
                    : 'не вказано'}
                </span>
              </p>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Досвід:</strong>
                <span className={s.value}>
                  {user.experience || 'не вказано'}
                </span>
              </p>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
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

              <div className={s.row + ' ' + s.multi}>
                <span className={s.label}>Про себе</span>
                <p className={s.about}>{user.aboutMe || 'не вказано'}</p>
              </div>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Заблокований:</strong>
                <span className={s.value}>{user.isBlocked ? 'Так' : 'Ні'}</span>
              </p>

              <p className={s.pWithStrong}>
                <strong className={s.label}>Потребує перевірки:</strong>
                <span className={s.value}>
                  {user.needsReview ? 'Так' : 'Ні'}
                </span>
              </p>

              <div className={s.row}>
                <span className={s.label}>Напрямки</span>
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
                  <span className={s.value}>не вказано</span>
                )}
              </div>

              {user.portfolio && user.portfolio.length > 0 && (
                <div className={s.portfolio}>
                  <div className={s.portfolioTitle}>Портфоліо</div>
                  <ul className={s.portfolioList}>
                    {user.portfolio.map((item, index) => (
                      <li key={index} className={s.portfolioItem}>
                        <div className={s.portfolioRow}>
                          <span className={s.portfolioLabel}>Тип:</span>
                          <span className={s.portfolioValue}>
                            {item.type === 'photo' ? 'Фото' : 'Відео'}
                          </span>
                        </div>

                        <div className={s.portfolioRow}>
                          <span className={s.portfolioLabel}>Опис:</span>
                          <span className={s.portfolioValue}>
                            {item.description || 'немає опису'}
                          </span>
                        </div>

                        <a
                          className={s.portfolioLink}
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
          </div>

          <LinkButton
            className={s.editButton}
            path="profile/edit"
            type={LINKDATA.TYPE_LIGHT_BORDER}
            linkText="Редагувати свій профіль"
          />
        </div>
      </Container>
    </section>
  );
}

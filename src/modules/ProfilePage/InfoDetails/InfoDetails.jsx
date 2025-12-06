'use client';

import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import { useTranslation } from 'react-i18next';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Loader from '@/shared/Loader/Loader';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { LINKDATA } from '@/shared/constants';

export default function InfoDetails() {
  const { user, loading } = useAuthGuard();
  const { t } = useTranslation(['roles']);

  if (loading) return <Loader />;
  if (!user) return <Loader />;

  const {
    name,
    surname,
    photo,
    city,
    country,
    email,
    role,
    accessRole,
    rating,
    experience,
    directions,
    onlineStatus,
    aboutMe,
    isBlocked,
    needsReview,
    portfolio,
  } = user;

  return (
    <div>
      <h1>Мій профіль</h1>

      <div>
        <div>
          <ImageWithFallback
            src={photo || '/image/logo.png'}
            alt={`${name} ${surname}`}
            width={80}
            height={80}
          />
        </div>

        <div>
          <p>
            <strong>Ім’я:</strong> {name}
          </p>
          <p>
            <strong>Прізвище:</strong> {surname}
          </p>
          <p>
            <strong>Місто:</strong> {city}
          </p>
          <p>
            <strong>Країна:</strong> {country}
          </p>
          <p>
            <strong>Електронна пошта:</strong> {email}
          </p>
          <p>
            <strong>Роль:</strong> {t(role)}
          </p>
          <p>
            <strong>Рівень доступу:</strong> {accessRole}
          </p>
          <p>
            <strong>Рейтинг:</strong> {rating}
          </p>
          <p>
            <strong>Досвід:</strong> {experience || 'не вказано'}
          </p>
          <p>
            <strong>Напрямки:</strong>{' '}
            {directions && directions.length > 0
              ? directions.join(', ')
              : 'не вказано'}
          </p>
          <p>
            <strong>Онлайн статус:</strong> {onlineStatus ? 'Онлайн' : 'Офлайн'}
          </p>
          <p>
            <strong>Про себе:</strong> {aboutMe || 'не вказано'}
          </p>
          <p>
            <strong>Заблокований:</strong> {isBlocked ? 'Так' : 'Ні'}
          </p>
          <p>
            <strong>Потребує перевірки:</strong> {needsReview ? 'Так' : 'Ні'}
          </p>

          {portfolio && portfolio.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>Портфоліо:</strong>
              <ul>
                {portfolio.map((item) => (
                  <li key={item.url}>
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
      </div>

      <LinkButton
        path="profile/edit"
        type={LINKDATA.TYPE_LIGHT_BORDER}
        linkText="Редегувати свій профіль"
      />
    </div>
  );
}

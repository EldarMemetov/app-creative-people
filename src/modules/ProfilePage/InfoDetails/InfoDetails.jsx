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
  if (!user) return null;

  return (
    <div>
      <h1>Мій профіль</h1>

      <div>
        <div>
          <ImageWithFallback
            src={user.photo || '/image/logo.png'}
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
            <strong>Електронна пошта:</strong> {user.email}
          </p>
          <p>
            <strong>Ролі:</strong>{' '}
            {user.roles && user.roles.length > 0
              ? user.roles.map((r) => t(r)).join(', ')
              : 'не вказано'}
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
            <strong>Онлайн статус:</strong>{' '}
            {user.onlineStatus ? 'Онлайн' : 'Офлайн'}
          </p>
          <p>
            <strong>Про себе:</strong> {user.aboutMe || 'не вказано'}
          </p>
          <p>
            <strong>Заблокований:</strong> {user.isBlocked ? 'Так' : 'Ні'}
          </p>
          <p>
            <strong>Потребує перевірки:</strong>{' '}
            {user.needsReview ? 'Так' : 'Ні'}
          </p>
          <p>
            <strong>Напрямки:</strong>{' '}
            {user.directions && user.directions.length > 0
              ? user.directions
                  .map((d) => t(d, { ns: 'directions' }))
                  .join(', ')
              : 'не вказано'}
          </p>

          {user.portfolio && user.portfolio.length > 0 && (
            <div style={{ marginTop: '10px' }}>
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
      </div>
      <LinkButton
        path="profile/edit"
        type={LINKDATA.TYPE_LIGHT_BORDER}
        linkText="Редегувати свій профіль"
      />
    </div>
  );
}

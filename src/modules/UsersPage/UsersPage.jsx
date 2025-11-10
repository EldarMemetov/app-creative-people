'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '@/services/api/users/api';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Loader from '@/shared/Loader/Loader';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <Loader />;
  if (error) return <div>Помилка: {error}</div>;
  if (users.length === 0) return <div>Немає зареєстрованих користувачів</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Усі користувачі</h1>

      {users.map((user) => (
        <div
          key={user._id}
          style={{
            marginBottom: '20px',
            border: '1px solid #000',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <ImageWithFallback
              src={user.safePhoto}
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
              <strong>Електронна пошта:</strong> {user.email}
            </p>
            <p>
              <strong>Роль:</strong> {user.role}
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
              {user.directions && user.directions.length > 0
                ? user.directions.join(', ')
                : 'не вказано'}
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
                        style={{ color: '#0070f3' }}
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
      ))}
    </div>
  );
}

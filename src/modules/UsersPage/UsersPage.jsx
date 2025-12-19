'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '@/services/api/users/api';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Loader from '@/shared/Loader/Loader';
import Link from 'next/link';
import Container from '@/shared/container/Container';
import s from './UsersPage.module.scss';
import { useSocket } from '@/hooks/useSocket';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { usersStatus } = useSocket();
  const { user: currentUser, loading: authLoading } = useAuthGuard();

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
        <h1 className={s.title}>Усі користувачі</h1>

        <div className={s.grid}>
          {users.map((user) => {
            const userIdKey = String(user._id ?? user.id ?? '');
            const isOnline = usersStatus[userIdKey] ?? false;

            // если это текущий пользователь, ведём на /profile
            const href =
              currentUser && currentUser._id === user._id
                ? '/profile'
                : `/talents/${user._id}`;

            return (
              <Link key={user._id} href={href} className={s.link}>
                <div className={s.card}>
                  <div className={s.photoWrapper}>
                    <ImageWithFallback
                      src={user.safePhoto}
                      alt={`${user.name} ${user.surname}`}
                      width={500}
                      height={700}
                      className={s.photo}
                    />
                  </div>

                  <div className={s.infoBlur}>
                    <p className={s.infoRow}>
                      <span className={s.label}>Ім’я:</span>
                      <span className={s.value}>{user.name}</span>
                    </p>

                    <p className={s.infoRow}>
                      <span className={s.label}>Прізвище:</span>
                      <span className={s.value}>{user.surname}</span>
                    </p>

                    <p className={s.infoRow}>
                      <span className={s.label}>Місто:</span>
                      <span className={s.value}>{user.city}</span>
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
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
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Container>
  );
}

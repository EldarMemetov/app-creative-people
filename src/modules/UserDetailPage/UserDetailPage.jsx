'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserById } from '@/services/api/users/api';
import Loader from '@/shared/Loader/Loader';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import Container from '@/shared/container/Container';
import { useAuth } from '../../services/store/useAuth';
import Modal from '@/shared/Modal/Modal';

export default function UserDetailPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const getSafePhoto = (url) => {
    if (!url) return '/image/logo.png';
    return url.startsWith('https://cdn.sanity.io') ||
      url.startsWith('https://res.cloudinary.com')
      ? url
      : '/image/logo.png';
  };

  useEffect(() => {
    if (!accessToken) {
      setShowModal(true);
      setLoading(false);
      return;
    }

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
  }, [id, accessToken]);

  if (loading) return <Loader />;
  if (error) return <div>Помилка: {error}</div>;
  if (!user && !showModal) return <div>Користувача не знайдено</div>;

  return (
    <Container>
      <section>
        <div style={{ padding: '20px' }}>
          {user && (
            <>
              <h1>Профіль користувача</h1>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
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
                    <strong>Роль:</strong> {user.role}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <h2>Щоб переглянути профіль користувача, будь ласка, зареєструйтесь</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => (window.location.href = '/signup')}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            Зареєструватися
          </button>
          <button
            onClick={() => (window.location.href = '/talents')}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            Закрити
          </button>
        </div>
      </Modal>
    </Container>
  );
}

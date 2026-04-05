'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  fetchMyApplications,
  withdrawApplication,
} from '@/services/api/postRole/api';
import styles from './ApplicationsComponent.module.scss';

function getStatusMeta(status, decision) {
  const finalStatus = decision || status;

  if (finalStatus === 'accepted') {
    return { text: 'Приняли', className: styles.accepted };
  }

  if (finalStatus === 'rejected') {
    return { text: 'Отклонили', className: styles.rejected };
  }

  if (finalStatus === 'withdrawn') {
    return { text: 'Отозвана', className: styles.withdrawn };
  }

  return { text: 'Ожидается ответ', className: styles.pending };
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU');
}

export default function ApplicationsComponent() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load applications', err);
      setError('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  }, [applications]);

  const handleWithdraw = async (applicationId) => {
    const ok = window.confirm('Отозвать заявку?');
    if (!ok) return;

    try {
      setActionLoadingId(applicationId);
      await withdrawApplication(applicationId);
      await loadApplications();
    } catch (err) {
      console.error('Failed to withdraw application', err);
      alert(err?.response?.data?.message || 'Не удалось отозвать заявку');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.center}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Мои заявки</h1>
          <p className={styles.subtitle}>
            Здесь видно, на какие посты ты подавался и какой у заявки статус.
          </p>
        </div>

        <button
          type="button"
          className={styles.reloadButton}
          onClick={loadApplications}
        >
          Обновить
        </button>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      {sortedApplications.length === 0 ? (
        <div className={styles.empty}>У тебя пока нет заявок.</div>
      ) : (
        <div className={styles.list}>
          {sortedApplications.map((app) => {
            const post = app.post;
            const statusMeta = getStatusMeta(app.status, app.decision);
            const canWithdraw = app.status === 'applied';

            return (
              <article key={app._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardMain}>
                    <div className={styles.row}>
                      <Link
                        href={`/posts/${post?._id}`}
                        className={styles.postLink}
                      >
                        {post?.title || 'Пост'}
                      </Link>

                      <span
                        className={`${styles.badge} ${statusMeta.className}`}
                      >
                        {statusMeta.text}
                      </span>
                    </div>

                    <div className={styles.meta}>
                      <span>
                        Роль: <strong>{app.appliedRole}</strong>
                      </span>
                      <span>Пост от: {formatDate(post?.createdAt)}</span>
                      <span>Заявка от: {formatDate(app.createdAt)}</span>
                    </div>

                    {post?.author ? (
                      <div className={styles.authorLine}>
                        <span>Автор поста:</span>{' '}
                        <Link
                          href={`/talents/${post.author._id}`}
                          className={styles.profileLink}
                        >
                          {post.author.name} {post.author.surname}
                        </Link>
                      </div>
                    ) : null}

                    {app.message ? (
                      <p className={styles.message}>{app.message}</p>
                    ) : null}
                  </div>

                  <div className={styles.actions}>
                    {canWithdraw ? (
                      <button
                        type="button"
                        className={styles.withdrawButton}
                        onClick={() => handleWithdraw(app._id)}
                        disabled={actionLoadingId === app._id}
                      >
                        {actionLoadingId === app._id
                          ? 'Отзыв...'
                          : 'Отозвать заявку'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

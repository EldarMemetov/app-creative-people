'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  fetchNotifications,
  markNotificationRead,
} from '@/services/api/notifications/api';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';
import Loader from '@/shared/Loader/Loader';
import s from './NotificationPage.module.scss';
import { useAuth } from '@/services/store/useAuth';
import Container from '@/shared/container/Container';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(1);
  const { socket } = useSocket();
  const router = useRouter();
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications({ page, limit: 50 });
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;

    const handler = (payload) => {
      if (!payload) return;
      if (!user) return;
      const isForMe =
        String(payload.user) === String(user._id) || payload.user === undefined;
      if (!isForMe) return;
      setNotifications((prev) => [payload, ...prev]);
    };

    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [socket, user]);

  const markRead = async (n) => {
    try {
      if (!n.read) {
        await markNotificationRead(n._id);
        setNotifications((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleItemClick = async (n) => {
    try {
      await markRead(n);

      if (n.relatedPost) {
        router.push(`/posts/${n.relatedPost}`);
      }
    } catch (err) {
      console.error('Failed to handle item click', err);
    }
  };

  const handleProfileClick = async (e, n) => {
    e.stopPropagation();
    try {
      await markRead(n);
      const meta = n.meta || {};
      if (meta.fromUserId) {
        router.push(`/talents/${meta.fromUserId}`);
      }
    } catch (err) {
      console.error('Failed to handle profile click', err);
    }
  };

  if (loading) return <Loader />;

  return (
    <section className={s.wrapper}>
      <Container>
        <div className={s.page}>
          <h1 className={s.heading}>Уведомления</h1>

          <ul className={s.list}>
            {notifications.length === 0 && (
              <li className={s.empty}>Нет уведомлений</li>
            )}
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`${s.item} ${n.read ? s.read : s.unread}`}
                onClick={() => handleItemClick(n)}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    handleItemClick(n);
                  }
                }}
              >
                <div className={s.title}>{n.title || 'Уведомление'}</div>
                <div className={s.message}>{n.message}</div>

                <div className={s.meta}>
                  <div className={s.metaLeft}>
                    {n.type === 'like' && n.meta?.fromUserName && (
                      <span className={s.metaUser}>
                        {n.meta.fromUserName} {n.meta.fromUserSurname}
                      </span>
                    )}
                  </div>

                  <div className={s.metaRight}>
                    <span className={s.time}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>

                    {n.meta?.fromUserId && (
                      <button
                        type="button"
                        className={s.viewProfile}
                        onClick={(e) => handleProfileClick(e, n)}
                      >
                        подивитись профіль
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

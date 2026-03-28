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
      if (!payload || !user) return;

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

  const normalizeId = (value) => {
    if (!value) return null;

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'object') {
      return (
        value._id ||
        value.id ||
        value.postId ||
        value.commentId ||
        value.targetId ||
        null
      );
    }

    return null;
  };

  const extractPostIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/\/posts\/([^/?#]+)/);
    return match?.[1] || null;
  };

  const extractCommentIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;

    const fromQuery = url.match(/[?&]commentId=([^&#]+)/);
    if (fromQuery?.[1]) return decodeURIComponent(fromQuery[1]);

    const fromHash = url.match(/#comment-([^/?#]+)/);
    if (fromHash?.[1]) return decodeURIComponent(fromHash[1]);

    return null;
  };

  const getNotificationTarget = (n) => {
    const meta = n?.meta || {};

    const postId =
      normalizeId(n.relatedPost) ||
      normalizeId(n.postId) ||
      normalizeId(n.relatedPostId) ||
      normalizeId(meta.postId) ||
      normalizeId(meta.relatedPost) ||
      normalizeId(meta.relatedPostId) ||
      normalizeId(meta.post?._id) ||
      normalizeId(meta.post) ||
      extractPostIdFromUrl(meta.postUrl) ||
      extractPostIdFromUrl(meta.url) ||
      null;

    const commentId =
      normalizeId(n.commentId) ||
      normalizeId(n.relatedComment) ||
      normalizeId(n.targetCommentId) ||
      normalizeId(meta.commentId) ||
      normalizeId(meta.replyCommentId) ||
      normalizeId(meta.likedCommentId) ||
      normalizeId(meta.targetCommentId) ||
      normalizeId(meta.replyToCommentId) ||
      normalizeId(meta.comment?._id) ||
      normalizeId(meta.comment) ||
      extractCommentIdFromUrl(meta.commentUrl) ||
      extractCommentIdFromUrl(meta.url) ||
      null;

    return { postId, commentId };
  };

  const goToTarget = async (n) => {
    await markRead(n);

    const { postId, commentId } = getNotificationTarget(n);

    if (postId && commentId) {
      router.push(
        `/posts/${postId}?commentId=${commentId}#comment-${commentId}`
      );
      return;
    }

    if (postId) {
      router.push(`/posts/${postId}`);
      return;
    }
  };

  const handleItemClick = async (n) => {
    try {
      await goToTarget(n);

      if (!getNotificationTarget(n).postId && n.meta?.fromUserId) {
        router.push(`/talents/${n.meta.fromUserId}`);
      }
    } catch (err) {
      console.error('Failed to handle item click', err);
    }
  };

  const handleProfileClick = async (e, n) => {
    e.stopPropagation();
    try {
      await markRead(n);
      if (n.meta?.fromUserId) {
        router.push(`/talents/${n.meta.fromUserId}`);
      }
    } catch (err) {
      console.error('Failed to handle profile click', err);
    }
  };

  const handleGoToPostClick = async (e, n) => {
    e.stopPropagation();
    try {
      await goToTarget(n);
    } catch (err) {
      console.error('Failed to go to post/comment', err);
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

            {notifications.map((n) => {
              const { postId, commentId } = getNotificationTarget(n);
              const hasTarget = Boolean(postId || commentId);

              return (
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
                      {n.meta?.fromUserName && (
                        <span className={s.metaUser}>
                          {n.meta.fromUserName} {n.meta.fromUserSurname}
                        </span>
                      )}
                    </div>

                    <div className={s.metaRight}>
                      <span className={s.time}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>

                      {hasTarget && (
                        <button
                          type="button"
                          className={s.viewProfile}
                          onClick={(e) => handleGoToPostClick(e, n)}
                        >
                          перейти
                        </button>
                      )}

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
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

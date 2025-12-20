'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchNotifications } from '@/services/api/notifications/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import s from './NotificationsIndicator.module.scss';

export default function NotificationsIndicator({ children }) {
  const [hasUnread, setHasUnread] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  const checkUnread = useCallback(async () => {
    try {
      const res = await fetchNotifications({ page: 1, limit: 50 });
      const list = res.data || [];
      setHasUnread(list.some((n) => !n.read));
    } catch (e) {
      console.error('Failed to check unread notifications', e);
    }
  }, []);

  useEffect(() => {
    checkUnread();
  }, [checkUnread]);

  useEffect(() => {
    if (!socket) return;

    const handler = (payload) => {
      if (!payload || !user) return;

      const isForMe =
        String(payload.user) === String(user._id) || payload.user === undefined;

      if (!isForMe) return;

      setHasUnread(true);
    };

    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [socket, user]);

  return (
    <div className={s.wrapper}>
      {children}
      {hasUnread && <span className={s.dot} />}
    </div>
  );
}

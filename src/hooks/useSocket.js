'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/services/store/useAuth';

export function useSocket() {
  const { accessToken } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [usersStatus, setUsersStatus] = useState({});

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('userStatusUpdate', ({ userId, onlineStatus }) => {
      if (!userId) return;
      const key = String(userId);
      setUsersStatus((prev) => ({ ...prev, [key]: Boolean(onlineStatus) }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [accessToken]);

  return { socket: socketRef.current, connected, usersStatus };
}

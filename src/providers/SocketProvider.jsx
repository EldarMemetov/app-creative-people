'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/services/store/useAuth';

const SocketContext = createContext({
  socket: null,
  connected: false,
  usersStatus: {},
});

export function SocketProvider({ children }) {
  const { accessToken } = useAuth();
  const socketRef = useRef(null);
  const tokenRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [usersStatus, setUsersStatus] = useState({});

  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (e) {}
        socketRef.current = null;
      }
      tokenRef.current = null;
      setConnected(false);
      setUsersStatus({});
      return;
    }

    if (socketRef.current && tokenRef.current === accessToken) return;

    if (socketRef.current && tokenRef.current !== accessToken) {
      try {
        socketRef.current.disconnect();
      } catch (e) {}
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    tokenRef.current = accessToken;

    const handleInitial = (map = {}) => {
      setUsersStatus((prev) => ({ ...prev, ...map }));
      console.debug(
        '[socket] initialUsersStatus received',
        Object.keys(map).length
      );
    };

    const handleUpdate = ({ userId, onlineStatus }) => {
      if (!userId) return;
      const key = String(userId);
      setUsersStatus((prev) => {
        if (prev[key] === Boolean(onlineStatus)) return prev;
        return { ...prev, [key]: Boolean(onlineStatus) };
      });
    };

    socket.on('connect', () => {
      setConnected(true);
      console.debug('[socket] connect', socket.id);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.debug('[socket] disconnect', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[socket] connect_error', err && err.message);
    });

    socket.on('initialUsersStatus', handleInitial);
    socket.on('userStatusUpdate', handleUpdate);

    return () => {
      try {
        socket.off('initialUsersStatus', handleInitial);
        socket.off('userStatusUpdate', handleUpdate);
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, usersStatus }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

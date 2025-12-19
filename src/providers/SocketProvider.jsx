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
  likesMap: {},
});

function maskToken(t) {
  if (!t) return 'no-token';
  return t.length > 8 ? `${t.slice(0, 6)}...${t.slice(-4)}` : 'short-token';
}

export function SocketProvider({ children }) {
  const { accessToken } = useAuth();
  const socketRef = useRef(null);
  const tokenRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [usersStatus, setUsersStatus] = useState({});
  const [likesMap, setLikesMap] = useState({});

  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      tokenRef.current = null;
      setConnected(false);
      setUsersStatus({});
      setLikesMap({});
      return;
    }

    if (socketRef.current && tokenRef.current === accessToken) return;

    if (socketRef.current && tokenRef.current !== accessToken) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
      setLikesMap({});
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;
    tokenRef.current = accessToken;

    const handleInitial = (map = {}) =>
      setUsersStatus((prev) => ({ ...prev, ...map }));
    const handleUpdate = ({ userId, onlineStatus }) => {
      if (!userId) return;
      setUsersStatus((prev) => ({ ...prev, [userId]: Boolean(onlineStatus) }));
    };

    const handleLikeUpdate = ({ toUserId, liked }) => {
      setLikesMap((prev) => {
        const prevCount = prev[toUserId]?.count ?? 0;
        return {
          ...prev,
          [toUserId]: {
            liked,
            count: liked ? prevCount + 1 : Math.max(prevCount - 1, 0),
          },
        };
      });
    };

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('initialUsersStatus', handleInitial);
    socket.on('userStatusUpdate', handleUpdate);
    socket.on('likeUpdate', handleLikeUpdate);

    return () => {
      socket.off('initialUsersStatus', handleInitial);
      socket.off('userStatusUpdate', handleUpdate);
      socket.off('likeUpdate', handleLikeUpdate);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
      setLikesMap({});
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, usersStatus, likesMap }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

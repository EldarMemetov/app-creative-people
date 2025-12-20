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
  usersStatusInitialized: false,
  likesMap: {},
});

export function SocketProvider({ children }) {
  const { accessToken } = useAuth();
  const socketRef = useRef(null);
  const tokenRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [usersStatus, setUsersStatus] = useState({});
  const [usersStatusInitialized, setUsersStatusInitialized] = useState(false);
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
      setUsersStatusInitialized(false);
      setLikesMap({});
      return;
    }

    if (socketRef.current && tokenRef.current === accessToken) return;

    if (socketRef.current && tokenRef.current !== accessToken) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
      setUsersStatusInitialized(false);
      setLikesMap({});
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;
    tokenRef.current = accessToken;

    const handleInitial = (map = {}) => {
      setUsersStatus(map || {});
      setUsersStatusInitialized(true);
      console.debug(
        '[socket] initialUsersStatus received count=',
        Object.keys(map || {}).length
      );
    };

    const handleUpdate = ({ userId, onlineStatus }) => {
      if (!userId) return;
      setUsersStatus((prev) => ({
        ...prev,
        [String(userId)]: Boolean(onlineStatus),
      }));
    };

    const handleLikeUpdate = (payload) => {
      const { toUserId, liked, likesCount } = payload || {};
      if (!toUserId) return;
      setLikesMap((prev) => ({
        ...prev,
        [String(toUserId)]: {
          liked: Boolean(liked),
          count:
            typeof likesCount === 'number'
              ? likesCount
              : (prev[String(toUserId)]?.count ?? 0),
        },
      }));
    };

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('initialUsersStatus', handleInitial);
    socket.on('userStatusUpdate', handleUpdate);
    socket.on('likeUpdate', handleLikeUpdate);

    return () => {
      try {
        socket.off('initialUsersStatus', handleInitial);
        socket.off('userStatusUpdate', handleUpdate);
        socket.off('likeUpdate', handleLikeUpdate);
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
      setUsersStatusInitialized(false);
      setLikesMap({});
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        usersStatus,
        usersStatusInitialized,
        likesMap,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

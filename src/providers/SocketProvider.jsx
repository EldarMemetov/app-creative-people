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

  useEffect(() => {
    console.debug(
      '[socket] EFFECT start — accessToken present?',
      !!accessToken
    );

    if (!accessToken) {
      console.debug(
        '[socket] no accessToken -> ensure disconnected and cleared'
      );
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
          console.debug('[socket] disconnected old socket on no-token');
        } catch (e) {
          console.warn('[socket] error disconnecting old socket', e);
        }
        socketRef.current = null;
      }
      tokenRef.current = null;
      setConnected(false);
      setUsersStatus({});
      return;
    }

    // reuse if same token
    if (socketRef.current && tokenRef.current === accessToken) {
      console.debug('[socket] socket already created for this token, reusing', {
        socketId: socketRef.current.id,
        tokenMasked: maskToken(accessToken),
      });
      return;
    }

    // if token changed, disconnect old
    if (socketRef.current && tokenRef.current !== accessToken) {
      console.debug('[socket] token changed -> disconnect old socket', {
        oldToken: maskToken(tokenRef.current),
        newToken: maskToken(accessToken),
      });
      try {
        socketRef.current.disconnect();
      } catch (e) {
        console.warn('[socket] error disconnecting old socket', e);
      }
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
    }

    console.debug('[socket] creating socket', {
      url: process.env.NEXT_PUBLIC_API_URL,
      tokenMasked: maskToken(accessToken),
    });

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

    // --- handlers ---
    const handleInitial = (map = {}) => {
      console.debug('[socket] initialUsersStatus received', {
        count: Object.keys(map).length,
        sampleKeys: Object.keys(map).slice(0, 10),
      });
      setUsersStatus((prev) => ({ ...prev, ...map }));
    };

    const handleUpdate = ({ userId, onlineStatus }) => {
      if (!userId) {
        console.warn('[socket] userStatusUpdate missing userId', {
          payload: { userId, onlineStatus },
        });
        return;
      }
      const key = String(userId);
      setUsersStatus((prev) => {
        const prevVal = prev[key];
        const newVal = Boolean(onlineStatus);
        if (prevVal === newVal) {
          console.debug('[socket] userStatusUpdate received but no change', {
            userId: key,
            value: newVal,
          });
          return prev;
        }
        console.debug('[socket] userStatusUpdate applying change', {
          userId: key,
          from: prevVal,
          to: newVal,
        });
        return { ...prev, [key]: newVal };
      });
    };

    socket.on('connect', () => {
      setConnected(true);
      console.debug('[socket] connect', {
        id: socket.id,
        tokenMasked: maskToken(accessToken),
      });
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.debug('[socket] disconnect', { reason, socketId: socket.id });
    });

    socket.on('connect_error', (err) => {
      console.warn('[socket] connect_error', err && err.message, err);
    });

    socket.on('initialUsersStatus', handleInitial);
    socket.on('userStatusUpdate', handleUpdate);

    // safety: also log raw events for debugging (comment out if too noisy)
    // socket.onAny((event, ...args) => console.debug('[socket] onAny', event, args));

    // cleanup on unmount or token change
    return () => {
      console.debug('[socket] cleanup — removing listeners and disconnecting', {
        socketId: socketRef.current?.id,
      });
      try {
        socket.off('initialUsersStatus', handleInitial);
        socket.off('userStatusUpdate', handleUpdate);
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.disconnect();
      } catch (e) {
        console.warn('[socket] error during cleanup', e);
      }
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
    };
  }, [accessToken]);

  // debug: show when usersStatus changes
  useEffect(() => {
    const keys = Object.keys(usersStatus || {});
    if (keys.length) {
      console.debug(
        '[socket] usersStatus state updated, total keys=',
        keys.length,
        'sample:',
        keys.slice(0, 10)
      );
    } else {
      console.debug('[socket] usersStatus empty');
    }
  }, [usersStatus]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, usersStatus }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

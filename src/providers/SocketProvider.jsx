// 'use client';

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
// } from 'react';
// import { io } from 'socket.io-client';
// import { useAuth } from '@/services/store/useAuth';

// const SocketContext = createContext({
//   socket: null,
//   connected: false,
//   usersStatus: {},
//   usersStatusInitialized: false,
//   likesMap: {},
//   joinPost: (id) => {},
//   leavePost: (id) => {},
//   emitEvent: (event, payload) => {},
// });

// export function SocketProvider({ children }) {
//   const { accessToken } = useAuth();
//   const socketRef = useRef(null);
//   const tokenRef = useRef(null);
//   const [connected, setConnected] = useState(false);
//   const [usersStatus, setUsersStatus] = useState({});
//   const [usersStatusInitialized, setUsersStatusInitialized] = useState(false);
//   const [likesMap, setLikesMap] = useState({});

//   useEffect(() => {
//     if (!accessToken) {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//       tokenRef.current = null;
//       setConnected(false);
//       setUsersStatus({});
//       setUsersStatusInitialized(false);
//       setLikesMap({});
//       return;
//     }

//     if (socketRef.current && tokenRef.current === accessToken) return;

//     if (socketRef.current && tokenRef.current !== accessToken) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//       setConnected(false);
//       setUsersStatus({});
//       setUsersStatusInitialized(false);
//       setLikesMap({});
//     }

//     const socket = io(process.env.NEXT_PUBLIC_API_URL, {
//       auth: { token: accessToken },
//       transports: ['websocket', 'polling'],
//       autoConnect: true,
//     });

//     socketRef.current = socket;
//     tokenRef.current = accessToken;

//     const handleInitial = (map = {}) => {
//       setUsersStatus(map || {});
//       setUsersStatusInitialized(true);
//     };

//     const handleUpdate = ({ userId, onlineStatus }) => {
//       if (!userId) return;
//       setUsersStatus((prev) => ({
//         ...prev,
//         [String(userId)]: Boolean(onlineStatus),
//       }));
//     };

//     const handleLikeUpdate = (payload) => {
//       if (!payload) return;
//       const { targetType, targetId, liked, likesCount, toUserId } = payload;

//       const makeKey = () => {
//         if (targetType === 'user') {
//           const idKey = String(toUserId || targetId);
//           return `user:${idKey}`;
//         }
//         if (targetType === 'post') {
//           return `post:${String(targetId)}`;
//         }
//         return `${String(targetType)}:${String(targetId)}`;
//       };

//       const key = makeKey();
//       if (!key) return;

//       const payloadObj = {
//         liked: typeof liked !== 'undefined' ? Boolean(liked) : undefined,
//         count: typeof likesCount === 'number' ? likesCount : undefined,
//       };

//       setLikesMap((prev) => ({
//         ...prev,
//         [key]: {
//           liked: payloadObj.liked ?? prev[key]?.liked,
//           count: payloadObj.count ?? prev[key]?.count,
//         },
//         ...(targetType === 'user'
//           ? {
//               [String(toUserId || targetId)]: {
//                 liked:
//                   payloadObj.liked ?? prev[String(toUserId || targetId)]?.liked,
//                 count:
//                   payloadObj.count ?? prev[String(toUserId || targetId)]?.count,
//               },
//             }
//           : {}),
//       }));
//     };

//     socket.on('connect', () => setConnected(true));
//     socket.on('disconnect', () => setConnected(false));
//     socket.on('initialUsersStatus', handleInitial);
//     socket.on('userStatusUpdate', handleUpdate);
//     socket.on('likeUpdate', handleLikeUpdate);
//     socket.on('connect_error', (err) => {
//       console.warn('[socket] connect_error', err?.message || err);
//     });

//     return () => {
//       try {
//         socket.off('initialUsersStatus', handleInitial);
//         socket.off('userStatusUpdate', handleUpdate);
//         socket.off('likeUpdate', handleLikeUpdate);
//         socket.off('connect_error');
//         socket.disconnect();
//       } catch (e) {}
//       socketRef.current = null;
//       setConnected(false);
//       setUsersStatus({});
//       setUsersStatusInitialized(false);
//       setLikesMap({});
//     };
//   }, [accessToken]);

//   const joinPost = useCallback((postId) => {
//     try {
//       const s = socketRef.current;
//       if (!s || !postId) return;
//       s.emit('joinPost', postId);
//     } catch (e) {
//       console.warn('[socket] joinPost error', e);
//     }
//   }, []);

//   const leavePost = useCallback((postId) => {
//     try {
//       const s = socketRef.current;
//       if (!s || !postId) return;
//       s.emit('leavePost', postId);
//     } catch (e) {
//       console.warn('[socket] leavePost error', e);
//     }
//   }, []);

//   const emitEvent = useCallback((event, payload) => {
//     try {
//       const s = socketRef.current;
//       if (!s || !event) return;
//       s.emit(event, payload);
//     } catch (e) {
//       console.warn('[socket] emit error', e);
//     }
//   }, []);

//   return (
//     <SocketContext.Provider
//       value={{
//         socket: socketRef.current,
//         connected,
//         usersStatus,
//         usersStatusInitialized,
//         likesMap,
//         joinPost,
//         leavePost,
//         emitEvent,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// }

// export const useSocket = () => useContext(SocketContext);
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/services/store/useAuth';

const SocketContext = createContext({
  socket: null,
  connected: false,
  usersStatus: {},
  usersStatusInitialized: false,
  likesMap: {},
  joinPost: (id) => {},
  leavePost: (id) => {},
  emitEvent: (event, payload) => {},
});

export function SocketProvider({ children }) {
  const { accessToken, user } = useAuth();
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
    };

    const handleUpdate = ({ userId, onlineStatus }) => {
      if (!userId) return;
      setUsersStatus((prev) => ({
        ...prev,
        [String(userId)]: Boolean(onlineStatus),
      }));
    };

    const handleLikeUpdate = (payload) => {
      if (!payload) return;
      const { targetType, targetId, liked, likesCount, toUserId, fromUserId } =
        payload;

      const makeKey = () => {
        if (targetType === 'user') {
          const idKey = String(toUserId || targetId);
          return `user:${idKey}`;
        }
        if (targetType === 'post') {
          return `post:${String(targetId)}`;
        }
        return `${String(targetType)}:${String(targetId)}`;
      };

      const key = makeKey();
      if (!key) return;

      const isActorCurrentUser = Boolean(
        fromUserId &&
          user &&
          String(user._1?._id || user._id) === String(fromUserId)
      );

      setLikesMap((prev) => {
        const prevEntry = prev[key] || {};

        const newEntry = {
          count: typeof likesCount === 'number' ? likesCount : prevEntry.count,

          liked: isActorCurrentUser
            ? typeof liked !== 'undefined'
              ? Boolean(liked)
              : prevEntry.liked
            : prevEntry.liked,
        };

        const res = { ...prev, [key]: newEntry };

        if (targetType === 'user') {
          const uidKey = String(toUserId || targetId);
          const prevUserEntry = prev[uidKey] || {};
          res[uidKey] = {
            count:
              typeof likesCount === 'number' ? likesCount : prevUserEntry.count,
            liked: isActorCurrentUser
              ? typeof liked !== 'undefined'
                ? Boolean(liked)
                : prevUserEntry.liked
              : prevUserEntry.liked,
          };
        }

        return res;
      });
    };

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('initialUsersStatus', handleInitial);
    socket.on('userStatusUpdate', handleUpdate);
    socket.on('likeUpdate', handleLikeUpdate);
    socket.on('connect_error', (err) => {
      console.warn('[socket] connect_error', err?.message || err);
    });

    return () => {
      try {
        socket.off('initialUsersStatus', handleInitial);
        socket.off('userStatusUpdate', handleUpdate);
        socket.off('likeUpdate', handleLikeUpdate);
        socket.off('connect_error');
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
      setConnected(false);
      setUsersStatus({});
      setUsersStatusInitialized(false);
      setLikesMap({});
    };
  }, [accessToken, user]);

  const joinPost = useCallback((postId) => {
    try {
      const s = socketRef.current;
      if (!s || !postId) return;
      s.emit('joinPost', postId);
    } catch (e) {
      console.warn('[socket] joinPost error', e);
    }
  }, []);

  const leavePost = useCallback((postId) => {
    try {
      const s = socketRef.current;
      if (!s || !postId) return;
      s.emit('leavePost', postId);
    } catch (e) {
      console.warn('[socket] leavePost error', e);
    }
  }, []);

  const emitEvent = useCallback((event, payload) => {
    try {
      const s = socketRef.current;
      if (!s || !event) return;
      s.emit(event, payload);
    } catch (e) {
      console.warn('[socket] emit error', e);
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        usersStatus,
        usersStatusInitialized,
        likesMap,
        joinPost,
        leavePost,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

// 'use client';

// import { useEffect } from 'react';
// import { useAuth } from '@/services/store/useAuth';

// export default function AuthProvider({ children }) {
//   useEffect(() => {
//     useAuth.getState().initAuth();
//   }, []);

//   return children;
// }
'use client';
import Loader from '@/shared/Loader/Loader';
import { useEffect, useState } from 'react';
import { useAuth } from '@/services/store/useAuth';
import { api } from '@/services/api/lib/api';

export default function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unsub;

    (async () => {
      try {
        await useAuth.getState().initAuth();

        unsub = useAuth.subscribe(
          (s) => s.accessToken,
          (token) => {
            if (token) {
              api.defaults.headers = api.defaults.headers || {};
              api.defaults.headers.Authorization = `Bearer ${token}`;
            } else {
              if (api.defaults.headers)
                delete api.defaults.headers.Authorization;
            }
          }
        );
      } catch (e) {
        console.error('[AuthProvider] initAuth error', e);
      } finally {
        setInitialized(true);
      }
    })();

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  if (!initialized) return <Loader />;

  return children;
}

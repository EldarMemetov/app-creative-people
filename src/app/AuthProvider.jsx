'use client';

import Loader from '@/shared/Loader/Loader';
import { useEffect, useState } from 'react';
import { useAuth } from '@/services/store/useAuth';
import { api } from '@/services/api/lib/api';

export default function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unsubToken = null;

    (async () => {
      try {
        await useAuth.getState().initAuth();

        unsubToken = useAuth.subscribe(
          (s) => s.accessToken,
          (token) => {
            if (token) {
              api.defaults.headers = api.defaults.headers || {};
              api.defaults.headers.Authorization = `Bearer ${token}`;
            } else if (api.defaults && api.defaults.headers) {
              delete api.defaults.headers.Authorization;
            }
          }
        );
      } catch (e) {
        console.error('[AuthProvider] initAuth error', e);
      } finally {
        if (mounted) setInitialized(true);
      }
    })();

    return () => {
      mounted = false;
      if (typeof unsubToken === 'function') unsubToken();
    };
  }, []);

  if (!initialized) return <Loader />;

  return children;
}

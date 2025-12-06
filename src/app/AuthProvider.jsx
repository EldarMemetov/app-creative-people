// 'use client';

// import { useEffect } from 'react';
// import { useAuth } from '@/services/store/useAuth';

// export default function AuthProvider({ children }) {
//   useEffect(() => {
//     useAuth.getState().initAuth();
//   }, []);

//   return children;
// }
// src/AuthProvider.jsx
'use client';

import Loader from '@/shared/Loader/Loader';
import { useEffect, useState } from 'react';
import { useAuth } from '@/services/store/useAuth';

export default function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await useAuth.getState().initAuth();
      } catch (e) {
        console.error('[AuthProvider] initAuth error', e);
      } finally {
        if (mounted) setInitialized(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!initialized) return <Loader />;

  return children;
}

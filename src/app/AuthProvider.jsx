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

export default function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await useAuth.getState().initAuth();
      } catch (e) {
        console.error('initAuth failed', e);
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

  if (!initialized) return <Loader />;

  return children;
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/store/useAuth';

export function useAuthGuard() {
  const { user, accessToken, refresh } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!user && accessToken) {
        const token = await refresh();
        if (!token && isMounted) {
          router.replace('/');
          return;
        }
      } else if (!user && !accessToken) {
        router.replace('/');
        return;
      }

      if (isMounted) setLoading(false);
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [user, accessToken, refresh, router]);

  return { user, loading };
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/store/useAuth';

export function useAuthGuard() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!auth.user) {
        const token = await auth.refresh();
        if (!token && isMounted) {
          router.push('/');
          return;
        }
      }

      if (isMounted) setLoading(false);
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [auth, router]);

  return { user: auth.user, loading };
}

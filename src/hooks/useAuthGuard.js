'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/store/useAuth';

export function useAuthGuard() {
  const { user, accessToken, isAuthChecked } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthChecked) return;

    if (!accessToken || !user) {
      router.replace('/');
      return;
    }

    setLoading(false);
  }, [isAuthChecked, accessToken, user, router]);

  return {
    user,
    loading: loading || !isAuthChecked,
  };
}

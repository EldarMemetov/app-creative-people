'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/services/store/useAuth';
import { useTranslation } from 'react-i18next';

export default function RequireAuth({ children, redirectTo = '/login' }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation(['common']);

  useEffect(() => {
    if (!user) {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`${redirectTo}?next=${next}`);
    }
  }, [user, router, pathname, redirectTo]);

  if (!user) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#9aa0c5' }}>
        {t('redirecting') || 'Перенаправление…'}
      </div>
    );
  }

  return children;
}

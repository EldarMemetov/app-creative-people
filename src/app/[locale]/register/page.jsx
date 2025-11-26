'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/store/useAuth';
import RegisterPage from '@/modules/RegisterPage/RegisterPage';

export default function Register() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.user) {
      router.replace('/profile');
    }
  }, [auth.user, router]);

  if (auth.user) return null;

  return <RegisterPage />;
}

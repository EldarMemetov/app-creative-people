'use client';

import { useEffect } from 'react';
import { useAuth } from '@/services/store/useAuth';

export default function AuthProvider({ children }) {
  useEffect(() => {
    useAuth.getState().initAuth();
  }, []);

  return children;
}

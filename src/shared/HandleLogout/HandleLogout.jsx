'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/store/useAuth';
import { useTranslation } from 'react-i18next';
export default function HandleLogout() {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation(['buttonLogout']);
  const handleLogout = async () => {
    await auth.logout();
    router.push('/');
  };
  return (
    <button
      onClick={handleLogout}
      style={{ marginTop: '15px', padding: '5px 10px' }}
    >
      {t('logout')}
    </button>
  );
}

'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/store/useAuth';
import { useTranslation } from 'react-i18next';
import s from './handleLogout.module.scss';
export default function HandleLogout() {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation(['buttonLogout']);
  const handleLogout = async () => {
    await auth.logout();
    router.push('/');
  };
  return (
    <button className={s.handleLogout} onClick={handleLogout}>
      {t('logout')}
    </button>
  );
}

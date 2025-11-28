import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { ROUTES, LINKDATA } from '@/shared/constants';
import s from './ButtonLoginRegister.module.scss';
import { useAuth } from '@/services/store/useAuth';
import { useTranslation } from 'react-i18next';

export default function ButtonLoginRegister({ onCloseMenu }) {
  const { t } = useTranslation(['textButton']);
  const auth = useAuth();

  if (auth.user) return null;

  return (
    <div className={s.wrapper}>
      <LinkButton
        path={ROUTES.LOGIN}
        type={LINKDATA.TYPE_LIGHT_BORDER}
        linkText={t('login')}
        onClick={() => {
          onCloseMenu?.(); // <<–– правильно
        }}
      />

      <LinkButton
        path={ROUTES.REGISTER}
        type={LINKDATA.TYPE_LIGHT_BORDER}
        linkText={t('register')}
        onClick={() => {
          onCloseMenu?.(); // <<–– правильно
        }}
      />
    </div>
  );
}

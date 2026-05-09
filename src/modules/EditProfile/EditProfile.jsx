'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@/shared/container/Container';
import Loader from '@/shared/Loader/Loader';
import { useAuth } from '@/services/store/useAuth';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { EditProfileSchema } from './EditProfileSchema/EditProfileSchema';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { ROUTES, LINKDATA } from '@/shared/constants';
import EditProfileAvatar from './EditProfileAvatar/EditProfileAvatar';
import EditProfileForm from './EditProfileForm/EditProfileForm';
import { getProfile } from '@/services/api/auth/auth';
import PortfolioManager from './PortfolioManager/PortfolioManager';
import s from './EditProfile.module.scss';

export default function EditProfile() {
  const { user: authUser, loading: guardLoading } = useAuthGuard();
  const setUserStore = useAuth((s) => s.setUser);
  const { t } = useTranslation(['editProfile']);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const ProfileSchema = EditProfileSchema(t);
  const [refreshing, setRefreshing] = useState(false);

  const refreshUser = useCallback(async () => {
    setRefreshing(true);
    try {
      const fullUser = await getProfile();
      if (fullUser) {
        setUserStore(fullUser);
        return fullUser;
      }
      return null;
    } catch (err) {
      console.error('Refresh user error:', err);
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [setUserStore]);

  if (guardLoading) return <Loader />;
  if (!authUser) return <div className={s.notFound}>{t('not_found')}</div>;

  return (
    <Container>
      <section className={s.section}>
        <div className={s.backWrap}>
          <LinkButton path={ROUTES.PROFILE} type={LINKDATA.HOME}>
            {t('back_to_profile')}
          </LinkButton>
        </div>

        <h1 className={s.title}>{t('edit_profile')}</h1>

        <div className={s.card}>
          <EditProfileAvatar
            user={authUser}
            setUser={() => {}}
            t={t}
            uploadingPhoto={uploadingPhoto}
            setUploadingPhoto={setUploadingPhoto}
            refreshUser={refreshUser}
            refreshing={refreshing}
          />
        </div>

        <div className={s.card}>
          <EditProfileForm
            user={authUser}
            ProfileSchema={ProfileSchema}
            t={t}
            uploadingPhoto={uploadingPhoto}
            refreshUser={refreshUser}
            refreshing={refreshing}
          />
        </div>

        <div className={s.card}>
          <PortfolioManager
            initialHeroType={authUser.heroType}
            initialHeroMedia={authUser.heroMedia}
            refreshUser={refreshUser}
          />
        </div>
      </section>
    </Container>
  );
}

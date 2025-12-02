// 'use client';

// import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import Container from '@/shared/container/Container';
// import Loader from '@/shared/Loader/Loader';
// import { useAuth } from '@/services/store/useAuth';
// import { useAuthGuard } from '@/hooks/useAuthGuard';
// import { EditProfileSchema } from './EditProfileSchema/EditProfileSchema';
// import LinkButton from '@/shared/components/LinkButton/LinkButton';
// import { ROUTES, LINKDATA } from '@/shared/constants';
// import EditProfileAvatar from './EditProfileAvatar/EditProfileAvatar';
// import EditProfileForm from './EditProfileForm/EditProfileForm';
// import { getProfile } from '@/services/api/auth/auth';

// export default function EditProfile() {
//   const { user: authUser, loading: guardLoading } = useAuthGuard();
//   const { t } = useTranslation(['editProfile']);
//   const [user, setUser] = useState(authUser);
//   const [uploadingPhoto, setUploadingPhoto] = useState(false);
//   const { setUser: setUserStore } = useAuth();
//   const ProfileSchema = EditProfileSchema(t);

//   const refreshUser = async () => {
//     try {
//       const fullUser = await getProfile();
//       setUser(fullUser);
//       setUserStore(fullUser);
//     } catch (err) {
//       console.error('Refresh user error:', err);
//     }
//   };

//   useEffect(() => {
//     setUser(authUser);
//   }, [authUser]);

//   if (guardLoading) return <Loader />;
//   if (!user) return <div>{t('not_found')}</div>;

//   return (
//     <Container>
//       <section>
//         <LinkButton path={ROUTES.PROFILE} type={LINKDATA.HOME}>
//           {t('back_to_profile')}
//         </LinkButton>
//         <h1>{t('edit_profile')}</h1>

//         <EditProfileAvatar
//           user={user}
//           setUser={setUser}
//           t={t}
//           uploadingPhoto={uploadingPhoto}
//           setUploadingPhoto={setUploadingPhoto}
//           refreshUser={refreshUser}
//         />

//         <EditProfileForm
//           user={user}
//           setUser={setUser}
//           setUserStore={setUserStore}
//           ProfileSchema={ProfileSchema}
//           t={t}
//           uploadingPhoto={uploadingPhoto}
//           refreshUser={refreshUser}
//         />
//       </section>
//     </Container>
//   );
// }
'use client';

import { useEffect, useState, useCallback } from 'react';
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

export default function EditProfile() {
  const { user: authUser, loading: guardLoading } = useAuthGuard();
  const { t } = useTranslation(['editProfile']);
  const [user, setUser] = useState(authUser);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const setUserStore = useAuth((s) => s.setUser);
  const ProfileSchema = EditProfileSchema(t);
  const [refreshing, setRefreshing] = useState(false);

  //
  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  const refreshUser = useCallback(async () => {
    let isMounted = true;
    try {
      setRefreshing(true);
      const fullUser = await getProfile();
      if (!isMounted) return null;
      setUser(fullUser);

      setUserStore(fullUser);
      return fullUser;
    } catch (err) {
      console.error('Refresh user error:', err);
      return null;
    } finally {
      if (isMounted) setRefreshing(false);
    }
  }, [setUserStore]);

  useEffect(() => {
    let mounted = true;
    return () => {
      mounted = false;
    };
  }, []);

  if (guardLoading) return <Loader />;
  if (!user) return <div>{t('not_found')}</div>;

  return (
    <Container>
      <section>
        <LinkButton path={ROUTES.PROFILE} type={LINKDATA.HOME}>
          {t('back_to_profile')}
        </LinkButton>
        <h1>{t('edit_profile')}</h1>

        <EditProfileAvatar
          user={user}
          setUser={setUser}
          t={t}
          uploadingPhoto={uploadingPhoto}
          setUploadingPhoto={setUploadingPhoto}
          refreshUser={refreshUser}
          refreshing={refreshing}
        />

        <EditProfileForm
          user={user}
          setUser={setUser}
          setUserStore={(u) => setUserStore(u)}
          ProfileSchema={ProfileSchema}
          t={t}
          uploadingPhoto={uploadingPhoto}
          refreshUser={refreshUser}
          refreshing={refreshing}
        />
      </section>
    </Container>
  );
}

'use client';

import Container from '@/shared/container/Container';
import InfoDetails from './InfoDetails/InfoDetails';
import HandleLogout from '@/shared/HandleLogout/HandleLogout';
import s from './ProfilePage.module.scss';
export default function ProfilePage() {
  return (
    <Container>
      <section>
        <div className={s.containerProfile}>
          <InfoDetails />
          <HandleLogout />
        </div>
      </section>
    </Container>
  );
}

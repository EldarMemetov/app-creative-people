'use client';

import Container from '@/shared/container/Container';
import InfoDetails from './InfoDetails/InfoDetails';
import HandleLogout from '@/shared/HandleLogout/HandleLogout';

export default function ProfilePage() {
  return (
    <Container>
      <section>
        <InfoDetails />
        <HandleLogout />
      </section>
    </Container>
  );
}

import CalendarManager from '@/modules/Calendar/CalendarManager.jsx/CalendarManager';
import ProfilePage from '@/modules/ProfilePage/ProfilePage';
import Container from '@/shared/container/Container';
import s from './profile.module.scss';
export default async function profile() {
  return (
    <section className={s.section}>
      <Container>
        <ProfilePage />
        <CalendarManager />
      </Container>
    </section>
  );
}

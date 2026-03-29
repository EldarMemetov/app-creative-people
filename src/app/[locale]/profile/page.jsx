import CalendarManager from '@/modules/Calendar/CalendarManager.jsx/CalendarManager';
import ProfilePage from '@/modules/ProfilePage/ProfilePage';

export default async function profile() {
  return (
    <div>
      <ProfilePage />
      <CalendarManager />
    </div>
  );
}

import InfoDetails from './InfoDetails/InfoDetails';
import HandleLogout from '@/shared/HandleLogout/HandleLogout';
import s from './ProfilePage.module.scss';
export default function ProfilePage() {
  return (
    <div className={s.section}>
      <HandleLogout />
      <InfoDetails />
    </div>
  );
}

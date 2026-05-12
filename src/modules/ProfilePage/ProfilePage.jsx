import CalendarManager from '../Calendar/CalendarManager.jsx/CalendarManager';
import InfoDetails from './InfoDetails/InfoDetails';

import s from './ProfilePage.module.scss';
export default function ProfilePage() {
  return (
    <div className={s.section}>
      <InfoDetails />
      <CalendarManager />
    </div>
  );
}

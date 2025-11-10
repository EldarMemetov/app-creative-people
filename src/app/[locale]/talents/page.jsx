import UsersPage from '@/modules/UsersPage/UsersPage';
import s from './talents.module.scss';

export default async function talents() {
  return (
    <div className={s.container}>
      <UsersPage />
    </div>
  );
}

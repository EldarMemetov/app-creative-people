import RegisterPage from '@/modules/RegisterPage/RegisterPage';
import s from './page.module.scss';
import LoginPage from '@/modules/LoginPage/LoginPage';

export default function Home() {
  return (
    <div className={s.container}>
      <RegisterPage />
      <LoginPage />
    </div>
  );
}

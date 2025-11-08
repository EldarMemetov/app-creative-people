import s from './page.module.scss';
import Footer from '@/modules/Footer/Footer';

export default async function Home() {
  return (
    <div className={s.container}>
      <Footer />
    </div>
  );
}

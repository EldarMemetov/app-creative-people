import HeroSection from '@/modules/HomePage/HeroSection/HeroSection';
import s from './page.module.scss';

export default function Home() {
  return (
    <div className={s.container}>
      <HeroSection />
    </div>
  );
}

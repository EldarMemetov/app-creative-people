import HeroSection from '@/modules/HomePage/HeroSection/HeroSection';
import s from './page.module.scss';
import WhoIsItForSection from '@/modules/HomePage/WhoIsItForSection/WhoIsItForSection';
import HowItWorks from '@/modules/HomePage/HowItWorks/HowItWorks';
import WhyUs from '@/modules/HomePage/WhyUs/WhyUs';
import JoinNow from '@/modules/HomePage/JoinNow/JoinNow';

export default function Home() {
  return (
    <div className={s.container}>
      <HeroSection />
      <WhoIsItForSection />
      <HowItWorks />
      <WhyUs />
      <JoinNow />
    </div>
  );
}

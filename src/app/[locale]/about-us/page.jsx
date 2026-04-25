import HeroAbout from '@/modules/AboutUs/HeroAbout/HeroAbout';
import s from './about-us.module.scss';
import OurValues from '@/modules/AboutUs/OurValues/OurValues';
import WhereWeAreGoing from '@/modules/AboutUs/WhereWeAreGoing/WhereWeAreGoing';
import GetStarted from '@/modules/AboutUs/GetStarted/GetStarted';

export default async function AboutUs() {
  return (
    <div className={s.container}>
      <HeroAbout />
      <OurValues />
      <WhereWeAreGoing />
      <GetStarted />
    </div>
  );
}

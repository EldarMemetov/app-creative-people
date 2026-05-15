import HeroAbout from '@/modules/AboutUs/HeroAbout/HeroAbout';
import s from './about-us.module.scss';
import OurValues from '@/modules/AboutUs/OurValues/OurValues';
import WhereWeAreGoing from '@/modules/AboutUs/WhereWeAreGoing/WhereWeAreGoing';
import GetStarted from '@/modules/AboutUs/GetStarted/GetStarted';

export default async function AboutUs({ params: rawParams }) {
  const params = await rawParams;
  const availableLocales = ['en', 'ua', 'de'];
  const locale = availableLocales.includes(params?.locale)
    ? params.locale
    : 'en';
  return (
    <div className={s.container}>
      <HeroAbout locale={locale} />
      <OurValues locale={locale} />
      <WhereWeAreGoing locale={locale} />
      <GetStarted locale={locale} />
    </div>
  );
}

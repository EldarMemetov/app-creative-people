import HeroSection from '@/modules/HomePage/HeroSection/HeroSection';
import s from './page.module.scss';
import WhoIsItForSection from '@/modules/HomePage/WhoIsItForSection/WhoIsItForSection';
import HowItWorks from '@/modules/HomePage/HowItWorks/HowItWorks';
import WhyUs from '@/modules/HomePage/WhyUs/WhyUs';
import JoinNow from '@/modules/HomePage/JoinNow/JoinNow';
import RenderOurStory from '@/modules/HomePage/RenderOurStory/RenderOurStory';
import ToggleQuestions from '@/modules/Faq/ToggleQuestions';
import ContactSection from '@/modules/ContactSection/ContactSection';

export default async function Home({ params: rawParams }) {
  const params = await rawParams;
  const availableLocales = ['en', 'ua', 'de'];
  const locale = availableLocales.includes(params?.locale)
    ? params.locale
    : 'en';
  return (
    <div className={s.container}>
      <HeroSection locale={locale} />
      <RenderOurStory locale={locale} />
      <WhoIsItForSection locale={locale} />
      <HowItWorks locale={locale} />
      <WhyUs locale={locale} />
      <JoinNow />
      <ToggleQuestions locale={locale} />
      <ContactSection />
    </div>
  );
}

import s from './about-us.module.scss';

import Footer from '@/modules/Footer/Footer';
export default async function AboutUs() {
  return (
    <div className={s.container}>
      <h1>AboutUs</h1>
      <Footer />
    </div>
  );
}

import s from './idPortfolio.module.scss';

import Footer from '@/modules/Footer/Footer';

export default async function PortfolioItemPage() {
  return (
    <div className={s.container}>
      <h1>PortfolioItemPage</h1>
      <Footer />
    </div>
  );
}

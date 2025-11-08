import s from './blog.module.scss';
import Footer from '@/modules/Footer/Footer';

export default async function BlogPage() {
  return (
    <div className={s.container}>
      <h1>BlogPage</h1>
      <Footer />
    </div>
  );
}

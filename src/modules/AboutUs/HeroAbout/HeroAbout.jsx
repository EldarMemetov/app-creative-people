import Container from '@/shared/container/Container';
import s from './HeroAbout.module.scss';

export default function HeroAbout() {
  return (
    <section className={s.hero}>
      <Container>
        <div className={s.inner}>
          <div className={s.text}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} aria-hidden="true" />
              Про QVRIX
            </span>

            <h1 className={s.title}>
              Ми створили місце, <em>якого не вистачало.</em>
            </h1>

            <p className={s.subtitle}>
              QVRIX народився з простої ідеї — обєднати творчих людей, які
              шукають одне одного, але не знають де знайти.
            </p>

            <div className={s.meta}>
              <span className={s.metaItem}>
                <span className={s.metaValue}>2026</span>
                <span className={s.metaLabel}>Заснування</span>
              </span>
              <span className={s.metaDivider} aria-hidden="true" />
              <span className={s.metaItem}>
                <span className={s.metaValue}>UA</span>
                <span className={s.metaLabel}>Створено в Україні</span>
              </span>
            </div>
          </div>

          <div className={s.collage}>
            <span className={s.glow} aria-hidden="true" />
            <span className={s.gridLines} aria-hidden="true" />

            <figure className={`${s.photo} ${s.photo1}`}>
              <span className={s.photoTag}>fotograf</span>
            </figure>
            <figure className={`${s.photo} ${s.photo2}`}>
              <span className={s.photoTag}>model</span>
            </figure>
            <figure className={`${s.photo} ${s.photo3}`}>
              <span className={s.photoTag}>creator</span>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}

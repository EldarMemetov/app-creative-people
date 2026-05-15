import Container from '@/shared/container/Container';
import s from './OurValues.module.scss';
import { initServerI18n } from '@/i18n/utils/serverI18n';

export default async function OurValues({ locale }) {
  const { t } = await initServerI18n(locale, ['ourValues']);

  const VALUES = t('values', { returnObjects: true });

  return (
    <section className={s.values}>
      <Container>
        <div className={s.head}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            {t('eyebrow')}
          </span>

          <h2 className={s.title}>
            {t('title')} <em>{t('titleAccent')}</em>
          </h2>
        </div>

        <ul className={s.grid}>
          {VALUES.map((v, i) => (
            <li
              key={v.num}
              className={`${s.card} ${i < 2 ? s.cardWide : s.cardNarrow}`}
            >
              <span className={s.cardNum}>{v.num}</span>

              <h3 className={s.cardTitle}>{v.title}</h3>

              <p className={s.cardText}>{v.text}</p>

              <span className={s.cardCorner} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

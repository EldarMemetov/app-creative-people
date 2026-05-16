import Container from '@/shared/container/Container';
import s from './WhyUs.module.scss';
import { initServerI18n } from '@/i18n/utils/serverI18n';
import Icon from '@/shared/Icon/Icon';

export default async function WhyUs({ locale }) {
  const { t } = await initServerI18n(locale, ['whyUs']);
  const features = t('features', { returnObjects: true });

  return (
    <section className={s.section}>
      <Container>
        <header className={s.header}>
          <span className={s.eyebrow}>
            <span className={s.dot} />
            {t('eyebrow')}
          </span>

          <h2 className={s.title}>{t('title')}</h2>

          <p className={s.subtitle}>{t('subtitle')}</p>
        </header>

        <ul className={s.grid}>
          {features.map((f, i) => (
            <li
              key={f.title}
              className={s.card}
              style={{ '--delay': `${0.15 + i * 0.1}s` }}
            >
              <span className={s.index}>{String(i + 1).padStart(2, '0')}</span>

              <div className={s.iconWrap}>
                <span className={s.iconOrbit} />
                <span className={s.iconGlow} />
                <Icon iconName={f.icon} className={s.icon} aria-hidden="true" />
              </div>

              <div className={s.body}>
                <h3 className={s.cardTitle}>{f.title}</h3>
                <p className={s.cardText}>{f.description}</p>
              </div>

              <span className={s.sweep} />
              <span className={s.corner} />
              <div className={s.cardBorder} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

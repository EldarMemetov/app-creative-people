import Container from '@/shared/container/Container';
import s from './HowItWorks.module.scss';
import { initServerI18n } from '@/i18n/utils/serverI18n';

export default async function HowItWorks({ locale }) {
  const { t } = await initServerI18n(locale, ['howItWorks']);

  const steps = t('steps', { returnObjects: true });

  return (
    <section className={s.section}>
      <Container>
        <header className={s.header}>
          <span className={s.eyebrow}>
            <span className={s.dot} />
            {t('eyebrow')}
          </span>

          <h2 className={s.title}>
            {t('title')} <span className={s.accent}>{t('titleAccent')}</span>
          </h2>

          <p className={s.subtitle}>{t('subtitle')}</p>
        </header>

        <div className={s.timeline}>
          <div className={s.track}>
            <span className={s.trackFill} />
          </div>

          <ol className={s.list}>
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={s.step}
                style={{ '--delay': `${0.2 + i * 0.25}s` }}
              >
                <div className={s.node}>
                  <span className={s.nodeRing} />
                  <span className={s.nodeCore} />
                </div>

                <div className={s.card}>
                  <span className={s.index}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className={s.body}>
                    <h3 className={s.cardTitle}>{step.title}</h3>

                    <p className={s.cardText}>{step.description}</p>
                  </div>

                  <span className={s.scan} />
                  <div className={s.cardBorder} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

import Container from '@/shared/container/Container';
import s from './WhereWeAreGoing.module.scss';
import { initServerI18n } from '@/i18n/utils/serverI18n';

export default async function WhereWeAreGoing({ locale }) {
  const { t } = await initServerI18n(locale, ['whereWeAreGoing']);

  return (
    <section className={s.vision}>
      <Container>
        <div className={s.inner}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            {t('eyebrow')}
          </span>

          <h2 className={s.title}>
            {t('title')}
            <br />
            <em>{t('titleAccent')}</em>
          </h2>

          <div className={s.body}>
            <p className={s.paragraph}>{t('paragraph1')}</p>

            <p className={s.paragraph}>{t('paragraph2')}</p>
          </div>

          <div className={s.spotlight}>
            <span className={s.spotlightLead}>{t('spotlightLead')}</span>

            <span className={s.spotlightHero}>{t('spotlightHero')}</span>

            <span className={s.spotlightOutro}>{t('spotlightOutro')}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}

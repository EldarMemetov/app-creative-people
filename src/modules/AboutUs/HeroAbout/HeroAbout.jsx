import Container from '@/shared/container/Container';
import s from './HeroAbout.module.scss';
import { initServerI18n } from '@/i18n/utils/serverI18n';

export default async function HeroAbout({ locale }) {
  const { t } = await initServerI18n(locale, ['heroAbout']);

  return (
    <section className={s.hero}>
      <Container>
        <div className={s.inner}>
          <div className={s.text}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} aria-hidden="true" />
              {t('eyebrow')}
            </span>

            <h1 className={s.title}>
              {t('title')} <em>{t('titleAccent')}</em>
            </h1>

            <p className={s.subtitle}>{t('subtitle')}</p>
          </div>

          <div className={s.collage}>
            <span className={s.glow} aria-hidden="true" />
            <span className={s.gridLines} aria-hidden="true" />

            <figure className={`${s.photo} ${s.photo1}`}>
              <span className={s.photoTag}>{t('tagPhotographer')}</span>
            </figure>

            <figure className={`${s.photo} ${s.photo2}`}>
              <span className={s.photoTag}>{t('tagModel')}</span>
            </figure>

            <figure className={`${s.photo} ${s.photo3}`}>
              <span className={s.photoTag}>{t('tagCreator')}</span>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}

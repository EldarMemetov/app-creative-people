import Container from '@/shared/container/Container';
import s from './HeroSection.module.scss';
import { ROUTES, LINKDATA } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { initServerI18n } from '@/i18n/utils/serverI18n';

export default async function HeroSection({ locale }) {
  const { t } = await initServerI18n(locale, ['heroSection']);

  return (
    <section className={s.hero}>
      <div className={s.bg}>
        <div className={s.bgImage} />
        <div className={s.overlay} />
        <div className={s.glowBlue} />
        <div className={s.glowViolet} />
        <div className={s.grain} />
      </div>

      <Container>
        <div className={s.inner}>
          <h1 className={s.title}>
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
            <br />
            <span className={s.accent}>{t('titleAccent')}</span>
          </h1>

          <p className={s.subtitle}>{t('subtitle')}</p>

          <div className={s.actions}>
            <LinkButton
              className={s.primary}
              path={ROUTES.REGISTER}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText={t('register')}
            />

            <LinkButton
              className={s.secondary}
              path={ROUTES.LOGIN}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText={t('login')}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

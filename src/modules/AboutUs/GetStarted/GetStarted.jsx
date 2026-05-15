import Container from '@/shared/container/Container';
import s from './GetStarted.module.scss';
import { ROUTES, LINKDATA } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { initServerI18n } from '@/i18n/utils/serverI18n';

export default async function GetStarted({ locale }) {
  const { t } = await initServerI18n(locale, ['getStarted']);

  return (
    <section className={s.cta}>
      <Container>
        <div className={s.inner}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            {t('eyebrow')}
          </span>

          <h2 className={s.title}>{t('title')}</h2>

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

import Container from '@/shared/container/Container';
import s from './RenderOurStory.module.scss';
import { initServerI18n } from '@/i18n/utils/serverI18n';

export default async function RenderOurStory({ locale }) {
  const { t } = await initServerI18n(locale, ['renderOurStory']);

  return (
    <section className={s.story}>
      <Container>
        <div className={s.inner}>
          <span className={s.eyebrow}>{t('eyebrow')}</span>

          <h2 className={s.title}>
            {t('title')} <em>{t('titleAccent')}</em>
          </h2>

          <p className={s.intro}>{t('intro')}</p>

          <div className={s.declaration}>
            <p className={s.declarationLead}>{t('declarationLead')}</p>

            <p className={s.declarationHero}>{t('declarationHero')}</p>
          </div>

          <p className={s.closing}>{t('closing')}</p>

          <span className={s.endMark}>{t('endMark')}</span>
        </div>
      </Container>
    </section>
  );
}

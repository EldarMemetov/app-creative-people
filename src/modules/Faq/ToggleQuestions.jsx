import Container from '@/shared/container/Container';
import { initServerI18n } from '@/i18n/utils/serverI18n';
import ToggleList from './ToggleList/ToggleList';
import styles from './ToggleQuestions.module.scss';

export default async function ToggleQuestions({ locale }) {
  const { t } = await initServerI18n(locale, ['toggleQuestions']);

  return (
    <section className={styles.section} id="faq">
      <Container>
        <div className={styles.contentSize}>
          <h2 className={styles.title}>{t('title')}</h2>

          <div className={styles.containerContent}>
            <p className={styles.description}>{t('description')}</p>
            <ToggleList items={t('faq', { returnObjects: true }) || []} />
          </div>
        </div>
      </Container>
    </section>
  );
}

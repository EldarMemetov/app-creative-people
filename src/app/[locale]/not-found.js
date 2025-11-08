'use client';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

import s from './notFoundPage.module.scss';
import Container from '@/shared/container/Container';

export default function NotFoundPage() {
  const { t } = useTranslation('notFound');

  return (
    <section className={s.section}>
      <Container>
        <div className={s.container}>
          <h2 className={s.title}>{t('notFoundTitle')}</h2>
          <p className={s.message}>{t('notFoundMessage')}</p>
          <Link href="/" className={s.link}>
            {t('backToHome')}
          </Link>
        </div>
      </Container>
    </section>
  );
}

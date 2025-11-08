import React from 'react';
import Container from '@/shared/container/Container';
import s from './PrivacyPolicy.module.scss';
import { initServerI18n } from '@/i18n/utils/serverI18n';
import ListPrivacyPolicy from '@/modules/PrivacyPolicy/ListPrivacyPolicy/ListPrivacyPolicy';

export default async function PrivacyPolicy({ locale }) {
  const { t } = await initServerI18n(locale, ['privacyPolicy']);
  const policy = t('policy', { returnObjects: true }) || {};
  const { title = '', intro = '', sections = [] } = policy;

  return (
    <section className={s.section}>
      <Container>
        {title && <h1 className={s.title}>{title}</h1>}
        {intro && <p className={s.descriptions}>{intro}</p>}
        <ListPrivacyPolicy sections={sections} />
      </Container>
    </section>
  );
}

'use client';

import Container from '@/shared/container/Container';
import s from './Footer.module.scss';
import Logo from '@/shared/Logo/Logo';
import NavMenu from '../Header/NavMenu/NavMenu';
import { SocialLinks } from '../Header/SocialLinks/SocialLinks';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation(['footer']);
  const locale = i18n.language;
  const currentYear = new Date().getFullYear();
  return (
    <footer className={s.footer}>
      <Container>
        <div className={s.padding}>
          <div className={s.containerFooter}>
            <div className={s.logoMobile}>
              <Logo variant="footer" />
            </div>

            <NavMenu variant="footer" locale={locale} />
            <div className={s.social}>
              <SocialLinks />
            </div>
          </div>
          <div className={s.privacyAndRights}>
            <p className={s.rights}>
              {t('rights').replace('{year}', currentYear)}
            </p>
            <div className={s.footerLinks}>
              <Link
                href={`/${locale}/privacy-policy`}
                className={s.privacyLink}
              >
                {t('privacy')}
              </Link>
            </div>
          </div>

          <div className={s.desktop}>
            <div className={s.desktopLogo}>
              <Logo variant="footer" />
              <p className={s.rights}>
                {t('rights').replace('{year}', currentYear)}
              </p>
            </div>
            <div className={s.desktopSocial}>
              <SocialLinks />
              <Link
                href={`/${locale}/privacy-policy`}
                className={s.privacyLink}
              >
                {t('privacy')}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

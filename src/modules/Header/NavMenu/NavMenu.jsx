'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import styles from './NavMenu.module.scss';
import { useAuth } from '../../../services/store/useAuth';
import Icon from '@/shared/Icon/Icon';
import ButtonLoginRegister from '../ButtonLoginRegister/ButtonLoginRegister';

function useIsMobile(breakpoint = 1154) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < breakpoint);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

const links = [
  { href: '', key: 'home' },
  { href: '/about-us', key: 'about' },
  { href: '/talents', key: 'talents' },
  { href: '/posts', key: 'posts' },
  { href: '/blog', key: 'blog' },
  { href: '/community', key: 'community' },
  { href: '/profile', key: 'profile' },
];

export default function NavMenu({
  variant,
  isMobileMenuOpen,
  onCloseMenu = () => {},
  onToggleMenu,
}) {
  const { t, i18n } = useTranslation('header');
  const [locale, setLocale] = useState(i18n.language);
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile(1154);
  const { user } = useAuth();
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (locale !== i18n.language) {
      onCloseMenu();
      setLocale(i18n.language);
    }
  }, [i18n.language, locale, onCloseMenu]);

  const isActive = (href) => {
    const localizedHref = `/${i18n.language}${href}`;
    if (href === '') {
      return (
        pathname === `/${i18n.language}` || pathname === `/${i18n.language}/`
      );
    }
    return (
      pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)
    );
  };

  const renderLinks = (styleVariant) => (
    <ul className={clsx(styles.navList, styles[styleVariant])}>
      {links
        .filter((link) => {
          if (link.href === '/profile' && !user) return false;
          return true;
        })
        .map(({ href, key }) => (
          <li
            key={key}
            className={clsx(styles.navItem, styles[styleVariant], {
              [styles.active]: isActive(href),
            })}
          >
            <Link
              href={`/${i18n.language}${href}`}
              className={clsx(styles.navLink, styles[styleVariant])}
              onClick={onCloseMenu}
            >
              {t(key)}
            </Link>
          </li>
        ))}
    </ul>
  );

  if (!isClient) return null;

  if (variant === 'header') {
    if (isMobile) {
      return (
        <div
          className={clsx(styles.mobileMenuItem, {
            [styles.openMenu]: isMobileMenuOpen,
          })}
        >
          {isMobileMenuOpen && (
            <div className={styles.mobileHeader}>
              <button onClick={onToggleMenu} className={styles.menuClose}>
                <Icon iconName="icon-close" className={styles.iconClose} />
              </button>
              <div className={styles.mobileContact}>
                <h3 className={styles.titleMobile}>{t('faq')}</h3>

                <ButtonLoginRegister onCloseMenu={onCloseMenu} />
              </div>
            </div>
          )}
          {renderLinks('header')}
        </div>
      );
    }

    return renderLinks('header');
  }

  return renderLinks('footer');
}

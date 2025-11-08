'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Header.module.scss';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher/LanguageSwitcher';
import Icon from '@/shared/Icon/Icon';
import Logo from '@/shared/Logo/Logo';
import NavMenu from './NavMenu/NavMenu';
import ScrollButton from '@/shared/ScrollButton/ScrollButton';

function Header() {
  const { t, i18n } = useTranslation('header');
  const [locale, setLocale] = useState(i18n.language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setLocale(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);

    return () => {
      window.removeEventListener('resize', setVh);
    };
  }, []);
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <Logo variant="header" />

      <nav id="main-navigation">
        {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}
        <NavMenu
          variant="header"
          isMobileMenuOpen={isMenuOpen}
          onToggleMenu={toggleMenu}
          onCloseMenu={closeMenu}
          locale={locale}
        />
      </nav>

      <div className={styles.containerButtonTrans}>
        <LanguageSwitcher />
        <div className={styles.buttonContact}>
          <ScrollButton targetId="feedback-form" variant="variant1">
            {t('kontakt')}
          </ScrollButton>
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          className={styles.menuButton}
          aria-label={t('openMenu')}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
        >
          <Icon iconName="icon-open" className={styles.iconOpen} />
        </button>
      </div>
    </header>
  );
}

export default React.memo(Header);

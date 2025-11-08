'use client';
import { useState } from 'react';
import { useLanguageChanger } from '../../../i18n/utils/LanguageChanger';
import styles from './LanguageSwitcher.module.scss';

const LanguageSwitcher = () => {
  const { handleChangeLanguage, currentLocale } = useLanguageChanger();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (locale) => {
    handleChangeLanguage(locale);
    setIsOpen(false);
  };

  const availableLanguages = ['ua', 'en', 'de'].filter(
    (lang) => lang !== currentLocale
  );

  return (
    <div
      className={styles.languageSwitcherContainer}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className={styles.languageButton}>
        {currentLocale.toUpperCase()}
      </button>

      {isOpen && (
        <ul className={styles.languageList}>
          {availableLanguages.map((lang) => (
            <li key={lang}>
              <button
                className={styles.languageOption}
                onClick={() => changeLanguage(lang)}
              >
                {lang.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;

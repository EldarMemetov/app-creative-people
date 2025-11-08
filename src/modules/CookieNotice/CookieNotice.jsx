'use client';

import s from './CookieNotice.module.scss';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const translations = {
  ua: {
    message:
      'Цей сайт використовує технічні cookie для збереження мовних налаштувань та забезпечення функціональності.',
    button: 'Зрозуміло',
    policyLinkText: 'Політика конфіденційності',
    policyLink: '/ua/privacy-policy',
  },
  en: {
    message:
      'This website uses technical cookies to remember language preferences and enable core functionality.',
    button: 'Got it',
    policyLinkText: 'Privacy Policy',
    policyLink: '/en/privacy-policy',
  },
  de: {
    message:
      'Diese Website verwendet technische Cookies, um Spracheinstellungen zu speichern und die Funktionalität zu gewährleisten.',
    button: 'Verstanden',
    policyLinkText: 'Datenschutzerklärung',
    policyLink: '/de/privacy-policy',
  },
};

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const t = translations[locale] || translations.en;

  useEffect(() => {
    const accepted = localStorage.getItem('cookie_notice_accepted');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_notice_accepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={s.cookieNotice}>
      <span>
        {t.message}{' '}
        <Link
          href={t.policyLink}
          className={s.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.policyLinkText}
        </Link>
        .
      </span>
      <button className={s.button} onClick={accept}>
        {t.button}
      </button>
    </div>
  );
}

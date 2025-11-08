'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function useLanguageChanger() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChangeLanguage = (newLocale) => {
    if (currentLocale === newLocale) return;

    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;

    const newPath = currentPathname.replace(
      `/${currentLocale}`,
      `/${newLocale}`
    );

    router.push(newPath);
    router.refresh();
  };

  return { currentLocale, handleChangeLanguage };
}

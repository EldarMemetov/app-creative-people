import '../globals.scss';
import initTranslations from '@/i18n/utils/i18n';
import TranslationsProvider from '@/i18n/utils/TranslationsProvider';
import ErrorBoundaryWithTranslation from '@/shared/components/ErrorBoundary/ErrorBoundaryWithTranslation/ErrorBoundaryWithTranslation';
import Header from '@/modules/Header/Header';
import { NAMESPACES } from '@/shared/constants';
import i18nConfig from '../../../i18nConfig';
import { dir } from 'i18next';
import SvgSpriteLoader from '@/shared/constants/SvgSpriteLoader/SvgSpriteLoader';
import { Manrope, Inter } from 'next/font/google';
import clsx from 'clsx';
import { Toaster } from 'react-hot-toast';
import Footer from '@/modules/Footer/Footer';
import AuthProvider from '../AuthProvider';
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-inter',
});
const metadataDict = {
  ua: {
    title: 'Тітле ',
    description: 'Опис',
  },
  en: {
    title: 'Тітле',
    description: 'Опис',
  },
  de: {
    title: 'Тітле',
    description: 'Опис',
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await Promise.resolve(params);
  const meta = metadataDict[locale] || metadataDict.en;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://qvrix.com/${locale}`,
      siteName: 'QVRIX',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function Layout({ children, params }) {
  const awaitedParams = await Promise.resolve(params);
  const { locale } = awaitedParams;
  const langMap = { ua: 'uk', en: 'en', de: 'de' };
  const htmlLang = langMap[locale] || 'en';
  const { resources } = await initTranslations(locale, NAMESPACES);

  return (
    <html lang={htmlLang} dir={dir(locale)}>
      <body
        suppressHydrationWarning={true}
        className={clsx(manrope.variable, inter.variable)}
      >
        <SvgSpriteLoader />

        <TranslationsProvider
          namespaces={NAMESPACES}
          locale={locale}
          resources={resources}
        >
          <AuthProvider>
            <ErrorBoundaryWithTranslation>
              <Header />
              <main>{children}</main>
              <Footer />
            </ErrorBoundaryWithTranslation>
          </AuthProvider>
        </TranslationsProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}

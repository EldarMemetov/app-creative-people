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
import { SocketProvider } from '@/providers/SocketProvider';

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

const BASE_URL = 'https://qvrix.com';

const metadataDict = {
  ua: {
    title:
      'QVRIX — Платформа для креативних людей | Фотографи, Моделі, Відеографи',
    description:
      'QVRIX — єдина креативна спільнота для фотографів, моделей, відеографів, стилістів та брендів в Україні та Європі. Знаходь команду, будуй портфоліо, створюй проєкти.',
    keywords:
      'фотограф, модель, відеограф, стиліст, візажист, творча платформа, колаборація, портфоліо, креативна спільнота, Україна',
  },
  en: {
    title:
      'QVRIX — Creative Platform for Photographers, Models & Videographers',
    description:
      'QVRIX is a creative community for photographers, models, videographers, stylists and brands across Ukraine and Europe. Find your team, build your portfolio, create together.',
    keywords:
      'photographer, model, videographer, stylist, makeup artist, creative platform, collaboration, portfolio, creative community, Europe',
  },
  de: {
    title: 'QVRIX — Kreativplattform für Fotografen, Models & Videografen',
    description:
      'QVRIX ist eine kreative Community für Fotografen, Models, Videografen, Stylisten und Marken in der Ukraine und Europa. Finde dein Team, baue dein Portfolio auf.',
    keywords:
      'Fotograf, Model, Videograf, Stylist, Visagist, Kreativplattform, Kollaboration, Portfolio, kreative Community, Europa',
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await Promise.resolve(params);
  const meta = metadataDict[locale] || metadataDict.en;
  const langMap = { ua: 'uk_UA', en: 'en_US', de: 'de_DE' };
  const ogLocale = langMap[locale] || 'en_US';

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'QVRIX' }],
    creator: 'QVRIX',
    publisher: 'QVRIX',
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        uk: `${BASE_URL}/ua`,
        en: `${BASE_URL}/en`,
        de: `${BASE_URL}/de`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}`,
      siteName: 'QVRIX',
      locale: ogLocale,
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'QVRIX — Creative Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      site: '@qvrix',
      creator: '@qvrix',
      images: [`${BASE_URL}/og-image.jpg`],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
            <SocketProvider>
              <ErrorBoundaryWithTranslation>
                <Header />
                <main>{children}</main>
                <Footer />
              </ErrorBoundaryWithTranslation>
            </SocketProvider>
          </AuthProvider>
        </TranslationsProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}

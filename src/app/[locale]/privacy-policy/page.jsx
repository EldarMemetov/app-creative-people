import PrivacyPolicy from '@/modules/PrivacyPolicy/PrivacyPolicy';
export default async function PrivacyPolicyPage({ params: rawParams }) {
  const params = await rawParams;
  const availableLocales = ['en', 'ua', 'de'];
  const locale = availableLocales.includes(params?.locale)
    ? params.locale
    : 'en';

  return (
    <div>
      <PrivacyPolicy locale={locale} />
    </div>
  );
}

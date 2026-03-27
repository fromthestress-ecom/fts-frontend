import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('buyingGuide');
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.vn";
  const localePrefix = locale && locale !== 'vi' ? `/${locale}` : '';
  const url = `${base}${localePrefix}/huong-dan-mua-hang`;

  return {
    title: t('title'),
    description: t('desc'),
    alternates: {
      canonical: url,
      languages: {
        vi: `${base}/huong-dan-mua-hang`,
        en: `${base}/en/huong-dan-mua-hang`,
      },
    },
    openGraph: {
      url,
      type: "website",
    },
  };
}

export default async function HuongDanMuaHangPage() {
  const t = await getTranslations('buyingGuide');
  const shared = await getTranslations('about');
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        {t('h1')}
      </h1>
      <div className="space-y-6 text-muted text-sm leading-relaxed sm:text-base">
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            {t('s1Title')}
          </h2>
          <p>
            {t('s1Content1')}
            <Link href="/san-pham" className="text-accent hover:underline">
              {t('s1Link')}
            </Link>
            {t('s1Content2')}
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            {t('s2Title')}
          </h2>
          <p>
            {t('s2Content1')}
            <Link href="/gio-hang" className="text-accent hover:underline">
              {t('s2Link')}
            </Link>
            {t('s2Content2')}
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            {t('s3Title')}
          </h2>
          <p>
            {t('s3Content')}
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            {t('s4Title')}
          </h2>
          <p>
            {t('s4Content')}
          </p>
        </section>
      </div>
      <p className="mt-8">
        <Link href="/" className="text-accent hover:underline">
          {shared('backToHome')}
        </Link>
      </p>
    </div>
  );
}

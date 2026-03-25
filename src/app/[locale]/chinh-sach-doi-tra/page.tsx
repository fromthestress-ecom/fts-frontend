import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('returns');
  return {
    title: t('title'),
    description: t('desc'),
    openGraph: {
      images: [{ url: "/images/og_refund.jpg", alt: t('title') }],
    },
  };
}

export default async function ChinhSachDoiTraPage() {
  const t = await getTranslations('returns');
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
            {t('s1Desc')}
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            {t('s2Title')}
          </h2>
          <p>
            {t('s2Desc')}
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            {t('s3Title')}
          </h2>
          <p>
            {t('s3Desc')}
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
            {t('s4Title')}
          </h2>
          <p>
            {t('s4Desc')}
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

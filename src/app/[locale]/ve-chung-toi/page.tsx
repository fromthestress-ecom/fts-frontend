import Link from "next/link";
import type { Metadata } from "next";
import { AboutLogoBackground } from "@/components/AboutLogoBackground";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about');
  return {
    title: t('title'),
    description: t('desc'),
  };
}

export default async function VeChungToiPage() {
  const t = await getTranslations('about');
  return (
    <div className="relative min-h-[60vh]">
      <AboutLogoBackground />
      <div className="relative z-10 mx-auto max-w-[720px] px-4 py-8 sm:px-6">
        <h1 className="font-display mb-2 text-2xl tracking-wide sm:text-3xl">
          {t('heading')}
        </h1>
        <p className="mb-8 text-lg font-medium text-muted sm:text-xl">
          {t('subheading')}
        </p>
        <div className="space-y-6 text-muted text-sm leading-relaxed sm:text-base">
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              {t('sec1Title')}
            </h2>
            <p>
              {t('sec1Desc')}
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              {t('sec2Title')}
            </h2>
            <p>
              {t('sec2Desc')}
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              {t('sec3Title')}
            </h2>
            <p>
              {t('sec3Desc')}
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-text sm:text-lg">
              {t('sec4Title')}
            </h2>
            <p>
              {t('sec4Desc')}
            </p>
          </section>
          <p className="text-center font-medium text-text">
            {t('welcome')}
          </p>
        </div>
        <p className="mt-8">
          <Link href="/" className="text-accent hover:underline">
            {t('backToHome')}
          </Link>
        </p>
      </div>
    </div>
  );
}

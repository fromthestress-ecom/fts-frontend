import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('referralPolicy');
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.vn";
  const localePrefix = locale && locale !== 'vi' ? `/${locale}` : '';
  const url = `${base}${localePrefix}/chinh-sach-gioi-thieu`;

  return {
    title: t('title'),
    description: t('desc'),
    alternates: {
      canonical: url,
      languages: {
        vi: `${base}/chinh-sach-gioi-thieu`,
        en: `${base}/en/chinh-sach-gioi-thieu`,
      },
    },
    openGraph: {
      url,
      images: [{ url: "/images/og_aff.jpg", alt: t('title') }],
    },
  };
}

export default async function ChinhSachGioiThieuPage() {
  const t = await getTranslations('referralPolicy');
  return (
    <div className="policy-page">
      <div className="policy-page__inner">
        <h1 className="policy-page__title">{t('h1')}</h1>

        <div className="policy-page__section">
          <h2>{t('s1Title')}</h2>
          <p>
            {t('s1Content')}
          </p>
        </div>

        <div className="policy-page__section">
          <h2>{t('s2Title')}</h2>
          <ul>
            <li>
              {t('s2i1')}
            </li>
            <li>{t('s2i2')}</li>
            <li>
              {t('s2i3')}
            </li>
            <li>
              {t('s2i4')}
            </li>
            <li>{t('s2i5')}</li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>{t('s3Title')}</h2>
          <ul>
            <li>
              {t('s3i1')}
            </li>
            <li>
              {t('s3i2')}
            </li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>{t('s4Title')}</h2>
          <ul>
            <li>{t('s4i1')}</li>
            <li>
              {t('s4i2')}
            </li>
            <li>
              {t('s4i3')}
            </li>
            <li>{t('s4i4')}</li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>{t('s5Title')}</h2>
          <ul>
            <li>{t('s5i1')}</li>
            <li>
              {t('s5i2')}
            </li>
            <li>
              {t('s5i3')}
            </li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>{t('s6Title')}</h2>
          <p>
            {t('s6Content')}
          </p>
        </div>
      </div>
    </div>
  );
}

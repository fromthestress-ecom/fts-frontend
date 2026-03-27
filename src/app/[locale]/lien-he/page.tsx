import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("contact");
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fromthestress.vn";
  const localePrefix = locale && locale !== "vi" ? `/${locale}` : "";
  const url = `${base}${localePrefix}/lien-he`;

  return {
    title: t("title"),
    description: t("desc"),
    alternates: {
      canonical: url,
      languages: {
        vi: `${base}/lien-he`,
        en: `${base}/en/lien-he`,
      },
    },
    openGraph: {
      url,
      type: "website",
    },
  };
}

export default async function LienHePage() {
  const t = await getTranslations("contact");
  return (
    <main>
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <section className="contact-hero">
        <Image
          src="/images/contact-pages.webp"
          alt="Contact banner"
          fill
          priority
          className="contact-hero__img"
          sizes="100vw"
        />
        <div className="contact-hero__overlay" />
        <div className="contact-hero__content">
          <div className="contact-hero__tags">
            <span className="banner-slider-hero__tag banner-slider-hero__tag--solid">
              {t("tag1")}
            </span>
            <span className="banner-slider-hero__tag banner-slider-hero__tag--outline">
              {t("tag2")}
            </span>
          </div>
          <h1
            className="contact-hero__title"
            style={{ whiteSpace: "pre-line" }}
          >
            {t("heading")}
          </h1>
          <p className="contact-hero__subtitle">{t("subheading")}</p>
          <div className="banner-slider-hero__ctas">
            <Link
              href="/san-pham"
              className="banner-slider-hero__btn banner-slider-hero__btn--primary"
            >
              {t("browse")}
            </Link>
            <Link
              href="/ve-chung-toi"
              className="banner-slider-hero__btn banner-slider-hero__btn--ghost"
            >
              {t("about")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Info Cards ──────────────────────────────────────────────── */}
      <section className="contact-info-section">
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-info-card__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </div>
            <p className="contact-info-card__value">info@fromthestress.com</p>
            <p className="contact-info-card__label">{t("emailLabel")}</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-card__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 .07h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
              </svg>
            </div>
            <p className="contact-info-card__value">+84 853 785 578</p>
            <p className="contact-info-card__label">{t("phoneLabel")}</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-card__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="contact-info-card__value">{t("locationValue")}</p>
            <p className="contact-info-card__label">{t("locationLabel")}</p>
          </div>
        </div>
      </section>

      {/* ── Form Section ────────────────────────────────────────────── */}
      <section className="contact-form-section">
        <div className="contact-form-layout">
          {/* Left: decorative image */}
          <div className="contact-form-image">
            <Image
              src="/images/contact-pages.webp"
              alt="FTS fashion"
              fill
              className="contact-form-image__img"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          {/* Right: form */}
          <div className="contact-form-box">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}

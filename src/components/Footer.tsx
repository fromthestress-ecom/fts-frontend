import Link from "next/link";
import { FooterAttribution } from "./FooterAttribution";
import { FooterCollapsibleSection } from "./FooterCollapsibleSection";
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  const FOOTER_LINKS = [
    { href: "/san-pham", label: t('products') },
    { href: "/ve-chung-toi", label: t('aboutUs') },
    { href: "/gio-hang", label: t('cart') },
  ] as const;

  const POLICY_LINKS = [
    { href: "/huong-dan-mua-hang", label: t('buyingGuide') },
    {
      href: "/chinh-sach-bao-mat",
      label: t('privacyPolicy'),
    },
    {
      href: "/chinh-sach-van-chuyen",
      label: t('shippingPolicy'),
    },
    { href: "/chinh-sach-doi-tra", label: t('returnPolicy') },
    { href: "/chinh-sach-gioi-thieu", label: t('affiliatePolicy') },
  ] as const;

  return (
    <footer className="border-t border-border bg-surface px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1280px] flex flex-col border-b border-border pb-6 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-8">
        <div className="border-b border-border py-4 md:border-b-0 md:py-0">
          <span className="font-display text-lg tracking-widest sm:text-xl">
            FROM THE STRESS
          </span>
          <p className="mt-2 max-w-[280px] text-sm text-muted sm:text-base">
            GEN STRESS STYLE <br />
            📍: Tan Binh, HCMC <br />
            <Link href="tel:0853783578" className="text-accent hover:underline">
              📞: 085 378 3578
            </Link>
          </p>
        </div>
        <FooterCollapsibleSection title={t('links')}>
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted hover:text-text sm:text-base"
            >
              {label}
            </Link>
          ))}
        </FooterCollapsibleSection>
        <FooterCollapsibleSection title={t('policies')}>
          {POLICY_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="max-w-[320px] text-sm text-muted hover:text-text sm:text-base"
            >
              {label}
            </Link>
          ))}
        </FooterCollapsibleSection>
      </div>
      <FooterAttribution />
    </footer>
  );
}

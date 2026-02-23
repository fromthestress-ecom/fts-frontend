import Link from "next/link";
import { FooterAttribution } from "./FooterAttribution";
import { FooterCollapsibleSection } from "./FooterCollapsibleSection";

const FOOTER_LINKS = [
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
  { href: "/gio-hang", label: "Giỏ hàng" },
] as const;

const POLICY_LINKS = [
  { href: "/huong-dan-mua-hang", label: "Hướng dẫn mua hàng & Thanh toán" },
  {
    href: "/chinh-sach-bao-mat",
    label: "Chính sách bảo mật thông tin khách hàng",
  },
  {
    href: "/chinh-sach-van-chuyen",
    label: "Chính sách vận chuyển & Giao nhận",
  },
  { href: "/chinh-sach-doi-tra", label: "Chính sách đổi trả và hoàn tiền" },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface px-4 py-8 sm:px-6">
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
        <FooterCollapsibleSection title="Liên kết">
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
        <FooterCollapsibleSection title="Chính sách & Hướng dẫn">
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

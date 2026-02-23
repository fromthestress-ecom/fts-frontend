import Link from "next/link";
import { FooterAttribution } from "./FooterAttribution";

const FOOTER_LINKS = [
  { href: "/san-pham", label: "Sản phẩm" },
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
      <div className="mx-auto max-w-[1280px] flex flex-wrap items-start justify-between gap-8 border-b border-border pb-6">
        <div>
          <span className="font-display text-lg tracking-widest sm:text-xl">
            FROM THE STRESS
          </span>
          <p className="mt-2 max-w-[280px] text-sm text-muted sm:text-base">
            Thời trang đường phố cao cấp. Giao hàng toàn quốc.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold sm:text-base">Liên kết</h3>
          <nav className="flex flex-col gap-2">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted hover:text-text sm:text-base"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Chính sách & Hướng dẫn
          </h3>
          <nav className="flex flex-col gap-2">
            {POLICY_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="max-w-[320px] text-sm text-muted hover:text-text sm:text-base"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <FooterAttribution />
    </footer>
  );
}

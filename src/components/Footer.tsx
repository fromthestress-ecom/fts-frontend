import Link from "next/link";
import { FooterAttribution } from "./FooterAttribution";

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
            <Link href="/san-pham" className="text-sm text-muted hover:text-text sm:text-base">
              Sản phẩm
            </Link>
            <Link href="/gio-hang" className="text-sm text-muted hover:text-text sm:text-base">
              Giỏ hàng
            </Link>
          </nav>
        </div>
      </div>
      <FooterAttribution />
    </footer>
  );
}

import Link from "next/link";
import { FooterAttribution } from "./FooterAttribution";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: "4rem",
        borderTop: "1px solid var(--border)",
        padding: "2rem 1.5rem",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "2rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1.5rem",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              letterSpacing: "0.1em",
            }}
          >
            FROM THE STRESS
          </span>
          <p
            style={{
              color: "var(--muted)",
              marginTop: "0.5rem",
              maxWidth: 280,
            }}
          >
            Thời trang đường phố cao cấp. Giao hàng toàn quốc.
          </p>
        </div>
        <div>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Liên kết
          </h3>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <Link href="/san-pham" style={{ color: "var(--muted)" }}>
              Sản phẩm
            </Link>
            <Link href="/gio-hang" style={{ color: "var(--muted)" }}>
              Giỏ hàng
            </Link>
          </nav>
        </div>
      </div>
      <FooterAttribution />
    </footer>
  );
}

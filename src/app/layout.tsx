import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";
import { PurchaseToast } from "@/components/PurchaseToast";
import { SocialButtons } from "@/components/SocialButtons";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { fetchApi } from "@/lib/api";
import type { Category } from "@/lib/api";
import { groupCategoriesForNav } from "@/lib/navGroups";

const SITE_NAME = "FROM THE STRESS";
const DEFAULT_DESC =
  "Shop streetwear cao cấp - áo hoodie, tee, quần jogger, giày sneaker. Giao hàng toàn quốc.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${SITE_NAME} | Thời trang đường phố`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,
  icons: {
    icon: [{ url: "/favicon/favicon-32x32.png", type: "image/svg+xml" }],
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    description: DEFAULT_DESC,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let navGroups: {
    label: string;
    children: { slug: string; name: string }[];
  }[] = [];
  try {
    const categories = await fetchApi<Category[]>("/categories");
    navGroups = groupCategoriesForNav(categories);
  } catch {
    navGroups = [];
  }

  return (
    <html lang="vi">
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <Header navGroups={navGroups} />
          <main>{children}</main>
          <Footer />
          <PurchaseToast />
          <SocialButtons />
        </ThemeProvider>
      </body>
    </html>
  );
}

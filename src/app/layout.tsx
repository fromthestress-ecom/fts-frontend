import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SocialButtons } from "@/components/SocialButtons";
import { ThemeScript } from "@/components/ThemeScript";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { Category } from "@/lib/api";
import { fetchApi } from "@/lib/api";
import { groupCategoriesForNav } from "@/lib/navGroups";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NavigationOverlay } from "@/components/NavigationOverlay";
import { Oswald, DM_Sans } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-oswald",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

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
    <html lang="vi" className={`${oswald.variable} ${dmSans.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CartDrawerProvider>
              <Suspense fallback={null}>
                <Header navGroups={navGroups} />
              </Suspense>
              <Suspense fallback={null}>
                <NavigationOverlay />
              </Suspense>
              <main>{children}</main>
              <Footer />
              <CartDrawer />
              {/* <PurchaseToast /> */}
              <SocialButtons />
            </CartDrawerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

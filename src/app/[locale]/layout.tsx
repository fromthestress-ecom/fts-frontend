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
import Script from "next/script";
import { Suspense } from "react";
import { NavigationOverlay } from "@/components/NavigationOverlay";
import { Oswald, DM_Sans } from "next/font/google";

const GA_ID = "G-HWRRD05NNB";
const FB_PIXEL_ID = "1164538798780806";
import "../globals.css";

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
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fromthestress.vn",
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
    images: [{ url: "/images/og_image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: {
    google: "nUgTDQrAWkwSlaEMmXXfnBAwkZTbRyZvVsF0MmUGdxw",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale || 'vi';

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

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
    <html lang={locale} className={`${oswald.variable} ${dmSans.variable}`}>
      <head>
        <ThemeScript />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <NextIntlClientProvider messages={messages} locale={locale}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

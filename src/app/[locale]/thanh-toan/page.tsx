import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'checkout' });
  return {
    title: t('checkout'),
    description: t('checkoutDesc'),
  };
}

export default async function CheckoutPage() {
  const t = await getTranslations('checkout');
  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        {t('checkoutUpper')}
      </h1>
      <CheckoutForm />
      <p className="mt-4 text-sm text-muted sm:text-base">
        <Link href="/gio-hang" className="text-accent hover:underline">
          {t('backToCart')}
        </Link>
      </p>
    </div>
  );
}

import { CartContent } from "@/components/CartContent";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'cart' });
  return {
    title: t('cart'),
    description: t('cartDesc'),
  };
}

export default async function CartPage() {
  const t = await getTranslations('cart');
  return (
    <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl tracking-wide sm:text-3xl">
        {t('cartUpper')}
      </h1>
      <CartContent />
    </div>
  );
}

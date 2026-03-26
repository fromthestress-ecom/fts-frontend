"use client";

import { useEffect, useState } from "react";
import { fetchApi, type Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useTranslations } from "next-intl";

export function EmbeddedProduct({ slug }: { slug?: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("product");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchApi<Product>(`/products/${slug}`)
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        console.error("Failed to load embedded product:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="my-8 max-w-sm mx-auto p-4 border border-border rounded-lg bg-surface animate-pulse flex gap-4">
        <div className="w-24 h-24 bg-border rounded"></div>
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 bg-border rounded w-3/4"></div>
          <div className="h-4 bg-border rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="my-10 p-6 border border-border rounded-xl bg-surface/50 max-w-sm mx-auto relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-0 right-0 bg-accent text-bg text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg z-10 shadow-sm">
        {t("featured") || "Featured"}
      </div>
      <ProductCard product={product} headingLevel="h3" />
    </div>
  );
}

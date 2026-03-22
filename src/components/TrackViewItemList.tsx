"use client";

import { useEffect } from "react";
import { trackViewItemList } from "@/lib/gtag";
import type { Product } from "@/lib/api";

type Props = {
  products: Product[];
  listName: string;
};

export function TrackViewItemList({ products, listName }: Props) {
  useEffect(() => {
    if (!products.length) return;
    trackViewItemList(
      products.map((p) => ({
        item_id: p._id,
        item_name: p.name,
        price: p.finalPrice ?? p.price,
      })),
      listName,
    );
  }, [products, listName]);

  return null;
}

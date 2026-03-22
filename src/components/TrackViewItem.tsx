"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/gtag";

type Props = {
  itemId: string;
  itemName: string;
  price: number;
  category?: string;
};

export function TrackViewItem({ itemId, itemName, price, category }: Props) {
  useEffect(() => {
    trackViewItem({
      item_id: itemId,
      item_name: itemName,
      price,
      item_category: category,
    });
  }, [itemId, itemName, price, category]);

  return null;
}

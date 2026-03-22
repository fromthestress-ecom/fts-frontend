export const GA_ID = "G-HWRRD05NNB";

type GtagItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
};

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(args);
}

export function trackViewItem(item: GtagItem) {
  gtag("event", "view_item", {
    currency: "VND",
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: GtagItem) {
  gtag("event", "add_to_cart", {
    currency: "VND",
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: GtagItem[], value: number) {
  gtag("event", "begin_checkout", {
    currency: "VND",
    value,
    items,
  });
}

export function trackPurchase(
  transactionId: string,
  items: GtagItem[],
  value: number,
  shipping: number,
) {
  gtag("event", "purchase", {
    transaction_id: transactionId,
    currency: "VND",
    value,
    shipping,
    items,
  });
}

export function trackViewItemList(items: GtagItem[], listName: string) {
  gtag("event", "view_item_list", {
    item_list_name: listName,
    items,
  });
}

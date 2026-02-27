import type { Category } from "@/lib/api";

const NAV_GROUP_ORDER = ["Tops", "Bottoms", "Collection"] as const;

export type NavGroupItem = {
  label: string;
  children: { slug: string; name: string }[];
};

export function groupCategoriesForNav(categories: Category[]): NavGroupItem[] {
  const withGroup = categories.filter(
    (c) => c.navGroup && NAV_GROUP_ORDER.includes(c.navGroup as (typeof NAV_GROUP_ORDER)[number]),
  );
  const byGroup = new Map<string, Category[]>();
  for (const c of withGroup) {
    const g = c.navGroup!;
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(c);
  }
  return NAV_GROUP_ORDER.map((label) => {
    const list = byGroup.get(label) ?? [];
    list.sort((a, b) => (a.groupOrder ?? 0) - (b.groupOrder ?? 0) || (a.order ?? 0) - (b.order ?? 0));
    return {
      label,
      children: list.map((c) => ({ slug: c.slug, name: c.name })),
    };
  }).filter((g) => g.children.length > 0);
}

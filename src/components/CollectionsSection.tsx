import Link from "next/link";
import { fetchApi, type ProductListResult, type Product } from "@/lib/api";
import { UpcomingCategoryRow } from "./UpcomingCategoryRow";

type CategoryGroup = {
  id: string;
  name: string;
  products: Product[];
  minPrice: number;
  maxPrice: number;
};

export async function CollectionsSection() {
  let preOrderItems: Product[] = [];
  try {
    const res = await fetchApi<ProductListResult>(
      "/products?preOrder=true&limit=100",
    );
    preOrderItems = res.items || [];
  } catch (err) {
    // console.error(err);
  }

  if (preOrderItems.length === 0) return null;

  const grouped = preOrderItems.reduce(
    (acc, p) => {
      // For populated category, we expect an object. If not, fallback to 'other'
      const catId =
        typeof p.categoryId === "object" && p.categoryId
          ? p.categoryId._id
          : p.categoryId || "khac";
      const catName =
        typeof p.categoryId === "object" && p.categoryId
          ? p.categoryId.name || "Khác"
          : "Khác";

      if (!acc[catId]) {
        acc[catId] = {
          id: catId,
          name: catName,
          products: [],
          minPrice: p.price,
          maxPrice: p.price,
        };
      }
      acc[catId].products.push(p);
      if (p.price < acc[catId].minPrice) acc[catId].minPrice = p.price;
      if (p.price > acc[catId].maxPrice) acc[catId].maxPrice = p.price;
      return acc;
    },
    {} as Record<string, CategoryGroup>,
  );

  const collections = Object.values(grouped);

  return (
    <section className="collections-section">
      <div className="collections-section__inner">
        <div className="collections-section__header">
          <div className="collections-section__eyebrow">
            <span className="collections-section__eyebrow-dot" />
            Upcoming Drops
          </div>
          <div className="collections-section__header-right">
            <h2 className="collections-section__heading">
              SẢN PHẨM
              <br />
              SẮP RA MẮT
            </h2>
            <Link
              href="/san-pham?preOrder=true"
              className="collections-section__shop-btn"
            >
              Xem tất cả
            </Link>
          </div>
        </div>

        <div className="collections-section__rows">
          {collections.map((group, i) => (
            <UpcomingCategoryRow
              key={group.id}
              group={group}
              imageLeft={i % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";

type CollectionItem = {
  tag: string;
  tagLabel: string;
  title: string;
  description: string;
  priceFrom: string;
  priceTo: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  /** image on left (even) or right (odd) */
  imageLeft: boolean;
};

const COLLECTIONS: CollectionItem[] = [
  {
    tag: "New",
    tagLabel: "Tops",
    title: "Premium streetwear\ncho phong cách bụi bặm",
    description:
      "Nâng tầm phong cách mỗi ngày với những chiếc áo được chế tác từ chất liệu cao cấp mang lại sự thoải mái bền bỉ.",
    priceFrom: "250.000đ",
    priceTo: "650.000đ",
    href: "/san-pham?danh_muc=tops",
    imageSrc:
      "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/sale-8%3A3.png",
    imageAlt: "FTS Tops collection",
    imageLeft: true,
  },
  {
    tag: "New",
    tagLabel: "Bottoms",
    title: "Modern daily\nwear cho mọi ngày",
    description:
      "Tôn vinh phong cách với những mẫu quần được thiết kế để mỗi ngày của bạn đều cảm thấy tươi mới và đặc biệt.",
    priceFrom: "350.000đ",
    priceTo: "750.000đ",
    href: "/san-pham?danh_muc=bottoms",
    imageSrc:
      "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/couple_sale.png",
    imageAlt: "FTS Bottoms collection",
    imageLeft: false,
  },
  {
    tag: "2025",
    tagLabel: "Collection",
    title: "Signature collection\nđậm chất F.T.S",
    description:
      "Khám phá bộ sưu tập đặc trưng mang tư duy From the Stress — từ áp lực đến phong cách riêng biệt.",
    priceFrom: "450.000đ",
    priceTo: "1.200.000đ",
    href: "/san-pham?danh_muc=collection",
    imageSrc:
      "https://pub-74aaef109f0d41358e5610e57268bc04.r2.dev/pages/banner/sale-8%3A3.png",
    imageAlt: "FTS Signature collection",
    imageLeft: true,
  },
];

export function CollectionsSection() {
  return (
    <section className="collections-section">
      <div className="collections-section__inner">
        {/* Header row */}
        <div className="collections-section__header">
          <div className="collections-section__eyebrow">
            <span className="collections-section__eyebrow-dot" />
            Our Collections
          </div>
          <div className="collections-section__header-right">
            <h2 className="collections-section__heading">
              Modern collections
              <br />
              defined by simplicity
            </h2>
            <Link href="/san-pham" className="collections-section__shop-btn">
              Shop all items
            </Link>
          </div>
        </div>

        {/* Collection rows */}
        <div className="collections-section__rows">
          {COLLECTIONS.map((col, i) => (
            <div
              key={i}
              className={`collections-section__row ${col.imageLeft ? "collections-section__row--img-left" : "collections-section__row--img-right"}`}
            >
              {/* Image card */}
              <div className="collections-section__img-card">
                <Image
                  src={col.imageSrc}
                  alt={col.imageAlt}
                  fill
                  className="collections-section__img"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* dot indicator */}
                <div className="collections-section__dots" aria-hidden>
                  {[0, 1, 2, 3, 4].map((d, di) => (
                    <span
                      key={d}
                      className={`collections-section__dot ${di === 0 ? "collections-section__dot--active" : ""}`}
                    />
                  ))}
                </div>
              </div>

              {/* Text card */}
              <div className="collections-section__text-card">
                <div className="collections-section__tags">
                  <span className="collections-section__tag collections-section__tag--pill">
                    {col.tag}
                  </span>
                  <span className="collections-section__tag collections-section__tag--label">
                    {col.tagLabel}
                  </span>
                </div>
                <h3 className="collections-section__title">
                  {col.title.split("\n").map((line, li) => (
                    <span key={li}>
                      {line}
                      {li < col.title.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </h3>
                <p className="collections-section__desc">{col.description}</p>

                <div className="collections-section__pricing-row">
                  <div className="collections-section__pricing">
                    <span className="collections-section__pricing-label">
                      Pricing start from:
                    </span>
                    <div className="collections-section__prices">
                      <span className="collections-section__price">
                        {col.priceFrom}
                      </span>
                      <span className="collections-section__price">
                        {col.priceTo}
                      </span>
                    </div>
                  </div>
                  <Link href={col.href} className="collections-section__cta">
                    All collections
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

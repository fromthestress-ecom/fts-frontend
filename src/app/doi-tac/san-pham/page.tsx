"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

interface AffProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  affiliateLink: string;
}

interface ProductResult {
  items: AffProduct[];
  total: number;
  page: number;
  totalPages: number;
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function SanPhamAffiliatePage() {
  const { token } = useAuth();
  const [data, setData] = useState<ProductResult | null>(null);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchApi<ProductResult>(`/affiliates/products?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setData)
      .catch(() => {});
  }, [token, page]);

  const copyLink = async (id: string, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareFB = (link: string) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      "_blank",
    );
  };

  const shareMsg = (link: string) => {
    window.open(
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(link)}&app_id=0&redirect_uri=${encodeURIComponent(link)}`,
      "_blank",
    );
  };

  return (
    <>
      <h1 className="affiliate-content__title">Sản phẩm & Link Affiliate</h1>

      {!data ? (
        <p className="text-muted">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <p className="text-muted">Không có sản phẩm nào.</p>
      ) : (
        <>
          {data.items.map((p) => {
            const imgSrc = p.images?.[0] || "/placeholder.png";
            return (
              <div key={p._id} className="affiliate-product-card">
                <img
                  src={imgSrc}
                  alt={p.name}
                  className="affiliate-product-card__img"
                />
                <div className="affiliate-product-card__info">
                  <p className="affiliate-product-card__name">{p.name}</p>
                  <p className="affiliate-product-card__price">
                    {formatVND(p.price)}
                  </p>
                </div>
                <div className="affiliate-product-card__actions">
                  <button
                    type="button"
                    onClick={() => copyLink(p._id, p.affiliateLink)}
                    className="affiliate-product-card__copy-btn"
                  >
                    {copiedId === p._id ? "✓ Copied" : "Copy Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareFB(p.affiliateLink)}
                    className="affiliate-product-card__copy-btn"
                    title="Share Facebook"
                  >
                    FB
                  </button>
                  <button
                    type="button"
                    onClick={() => shareMsg(p.affiliateLink)}
                    className="affiliate-product-card__copy-btn"
                    title="Share Messenger"
                  >
                    MSG
                  </button>
                </div>
              </div>
            );
          })}

          {data.totalPages > 1 && (
            <div className="affiliate-pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span
                className="text-muted"
                style={{ padding: "0.4rem 0.5rem", fontSize: "0.8rem" }}
              >
                {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

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
  isSoldOut?: boolean;
  inStock?: boolean;
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

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const copyLink = async (id: string, link: string) => {
    await copyToClipboard(link);
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
      <h1 className="partner-content__title">Sản phẩm & Link giới thiệu</h1>

      {!data ? (
        <p className="text-muted">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <p className="text-muted">Không có sản phẩm nào.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.items.map((p) => {
            const imgSrc = p.images?.[0] || "/placeholder.png";
            const soldOut = p.isSoldOut || !p.inStock;
            return (
              <div
                key={p._id}
                className={`flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-xl bg-surface items-center ${soldOut ? "opacity-60" : ""}`}
              >
                <div className="relative">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className={`w-20 h-20 object-cover rounded-md ${soldOut ? "grayscale" : ""}`}
                  />
                  {soldOut && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text">
                    {p.name}
                    {soldOut && (
                      <span className="ml-2 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white align-middle">
                        SOLD OUT
                      </span>
                    )}
                  </p>
                  <p className={`font-bold mt-1 ${soldOut ? "text-muted line-through" : "text-accent"}`}>
                    {formatVND(p.price)}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => copyLink(p._id, p.affiliateLink)}
                    disabled={soldOut}
                    className="flex-1 sm:flex-none px-4 py-2 border border-border bg-bg text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-text hover:enabled:text-bg"
                  >
                    {copiedId === p._id ? "✓ Đã copy" : "Copy Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareFB(p.affiliateLink)}
                    disabled={soldOut}
                    className="px-3 py-2 border border-blue-500 text-blue-500 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-blue-500 hover:enabled:text-white"
                    title="Share Facebook"
                  >
                    FB
                  </button>
                  <button
                    type="button"
                    onClick={() => shareMsg(p.affiliateLink)}
                    disabled={soldOut}
                    className="px-3 py-2 border border-blue-400 text-blue-400 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-blue-400 hover:enabled:text-white"
                    title="Share Messenger"
                  >
                    MSG
                  </button>
                </div>
              </div>
            );
          })}

          {data.totalPages > 1 && (
            <div className="partner-pagination mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span className="text-muted px-4 py-2 text-sm flex items-center">
                Trang {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

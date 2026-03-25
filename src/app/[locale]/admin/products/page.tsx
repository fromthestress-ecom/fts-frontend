"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getAdminKey } from "@/components/admin/AdminGuard";
import type { Category, ProductTemplate } from "@/lib/api";
import type Sortable from "sortablejs";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Product = {
  _id: string;
  slug: string;
  name: string;
  price: number;
  categoryId?: Category | null;
  isSoldOut?: boolean;
};

/**
 * Perform an HTTP request against the admin API using the stored admin key.
 *
 * @param path - API path appended to the configured admin API base URL (e.g., `/admin/products`)
 * @param init - Optional fetch init; provided options are merged with default headers. The request includes a `Content-Type: application/json` header and an `x-admin-key` header populated from the stored admin key.
 * @returns The fetch `Response` for the performed request.
 */
function adminFetch(path: string, init?: RequestInit) {
  const key = getAdminKey();
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": key ?? "",
      ...init?.headers,
    },
  });
}

/**
 * Admin page component that displays a sortable list of products and provides controls to reorder, save order, edit, and delete products.
 *
 * Renders a table with drag handles for reordering, a save-order action, links to create/edit products, and messaging for loading and operation results.
 *
 * @returns A React element for the admin products management UI.
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [orderDirty, setOrderDirty] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  const productsTbodyRef = useRef<HTMLTableSectionElement>(null);
  const productsSortableRef = useRef<Sortable | null>(null);

  const productIdSet = useMemo(
    () => new Set(products.map((p) => p._id)),
    [products],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/products");
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      setMessage("Lỗi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      setOrderDirty(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Initialize SortableJS for product row reordering
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !productsTbodyRef.current ||
      products.length === 0
    ) {
      if (productsSortableRef.current) {
        productsSortableRef.current.destroy();
        productsSortableRef.current = null;
      }
      return;
    }

    import("sortablejs").then((SortableModule) => {
      const SortableCtor = (SortableModule.default ??
        SortableModule) as unknown as new (
        el: HTMLElement,
        options: Record<string, unknown>,
      ) => Sortable;

      if (productsSortableRef.current) productsSortableRef.current.destroy();

      if (!productsTbodyRef.current) return;
      productsSortableRef.current = new SortableCtor(productsTbodyRef.current, {
        animation: 150,
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        handle: ".drag-handle",
        onEnd: () => {
          const rows = Array.from(
            productsTbodyRef.current?.querySelectorAll("tr[data-id]") ?? [],
          );
          const ids = rows
            .map((r) => (r as HTMLElement).getAttribute("data-id") ?? "")
            .filter(Boolean);
          if (ids.length !== products.length) return;
          if (!ids.every((id) => productIdSet.has(id))) return;
          setProducts((prev) => {
            const byId = new Map(prev.map((p) => [p._id, p]));
            return ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
          });
          setOrderDirty(true);
          setMessage(""); // clear previous messages
        },
      });
    });

    return () => {
      if (productsSortableRef.current) {
        productsSortableRef.current.destroy();
        productsSortableRef.current = null;
      }
    };
  }, [products.length, productIdSet]);

  const saveProductOrder = async () => {
    setMessage("");
    setOrderSaving(true);
    try {
      const items = products.map((p, index) => ({ id: p._id, order: index }));
      const res = await adminFetch("/admin/products/reorder", {
        method: "PUT",
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Lỗi lưu thứ tự");
      setOrderDirty(false);
      setMessage("Đã lưu thứ tự sản phẩm.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi lưu thứ tự");
    } finally {
      setOrderSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      const res = await adminFetch(`/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xoá thất bại");
      await load();
    } catch (err) {
      setMessage("Lỗi xoá sản phẩm");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-xl sm:text-2xl text-text">Sản phẩm</h1>
        <Link
          href="/admin/products/create"
          className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-sm"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm sản phẩm mới
        </Link>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded text-sm ${message.includes("Lỗi") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-muted text-sm">Đang tải danh sách...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="border-b border-border bg-bg/50 px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-muted flex items-center gap-1.5 font-medium">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Kéo biểu tượng ↕ để sắp xếp thứ tự
            </span>
            <button
              type="button"
              disabled={!orderDirty || orderSaving}
              onClick={saveProductOrder}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold ${
                orderDirty
                  ? "cursor-pointer bg-accent text-bg hover:bg-accent/90"
                  : "cursor-not-allowed bg-border text-muted"
              } transition-colors flex items-center gap-1.5`}
            >
              {orderSaving && (
                <svg
                  className="animate-spin h-3 w-3 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {orderSaving ? "Đang lưu..." : "Lưu thứ tự"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted uppercase bg-bg/30">
                <tr className="border-b border-border">
                  <th scope="col" className="w-12 px-6 py-3 font-medium"></th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium text-right">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody ref={productsTbodyRef} className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted"
                    >
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p._id}
                      data-id={p._id}
                      className="hover:bg-bg/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span
                          className="drag-handle inline-flex h-8 w-8 cursor-grab select-none items-center justify-center rounded border border-transparent text-muted hover:border-border hover:bg-bg transition-colors"
                          title="Kéo để sắp xếp"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="15 18 9 12 15 6" />
                            <polyline
                              points="21 18 15 12 21 6"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            <polyline
                              points="9 18 3 12 9 6"
                              className="hidden"
                            />
                          </svg>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginLeft: "-8px" }}
                          >
                            <polyline points="9 18 3 12 9 6" />
                          </svg>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-text">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2">
                            {p.name}
                            {p.isSoldOut && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-100 text-red-600 border border-red-200">
                                Sold Out
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-normal text-muted truncate max-w-[200px]">
                            {p.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {new Intl.NumberFormat("vi-VN").format(p.price)}₫
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {p.categoryId && typeof p.categoryId === "object"
                          ? (p.categoryId as Category).name
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/products/${p._id}`}
                          title="Sửa"
                          className="inline-flex items-center justify-center rounded p-2 text-blue-500 hover:bg-blue-500/10 transition-colors mr-2"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id, p.name)}
                          title="Xóa"
                          className="inline-flex items-center justify-center rounded p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

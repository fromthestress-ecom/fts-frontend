"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";
import type { Category, ProductTemplate } from "@/lib/api";
import type Sortable from "sortablejs";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Product = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId?: Category | null;
  templateId?: ProductTemplate | null;
  inStock: boolean;
  stockQuantity: number;
  sizes: string[];
  colors: string[];
  sizeChart?: string;
  order: number;
  preOrder?: boolean;
};

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

function adminUploadFile(file: File): Promise<{ url: string; key: string }> {
  const key = getAdminKey();
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${API}/admin/upload`, {
    method: "POST",
    headers: {
      "x-admin-key": key ?? "",
    },
    body: formData,
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new Error(data.message || "Upload thất bại");
      });
    }
    return res.json();
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    templateId: "",
    images: [] as string[],
    sizes: "",
    colors: "",
    stockQuantity: "0",
    inStock: true,
    preOrder: false,
  });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  const productsTbodyRef = useRef<HTMLTableSectionElement>(null);
  const productsSortableRef = useRef<Sortable | null>(null);

  const productIdSet = useMemo(
    () => new Set(products.map((p) => p._id)),
    [products],
  );

  const load = async () => {
    setLoading(true);
    const [resP, resC, resT] = await Promise.all([
      adminFetch("/admin/products"),
      adminFetch("/admin/categories"),
      adminFetch("/admin/templates"),
    ]);
    if (resP.ok) setProducts(await resP.json());
    if (resC.ok) setCategories(await resC.json());
    if (resT.ok) setTemplates(await resT.json());
    setLoading(false);
    setOrderDirty(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Initialize SortableJS for image reordering
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !imagesContainerRef.current ||
      form.images.length === 0
    ) {
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
      }
      return;
    }

    // Dynamically import SortableJS
    import("sortablejs").then((SortableModule) => {
      const Sortable = SortableModule.default || SortableModule;
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
      }
      if (imagesContainerRef.current) {
        sortableInstanceRef.current = new Sortable(imagesContainerRef.current, {
          animation: 150,
          ghostClass: "sortable-ghost",
          dragClass: "sortable-drag",
          onEnd: () => {
            const items = Array.from(
              imagesContainerRef.current?.children || [],
            );
            const newOrder = items
              .map((item) => {
                const div = item as HTMLElement;
                return div.getAttribute("data-url") || "";
              })
              .filter(Boolean);
            if (newOrder.length === form.images.length) {
              setForm((f) => ({ ...f, images: newOrder }));
            }
          },
        });
      }
    });

    return () => {
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
      }
    };
  }, [form.images]);

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
      // reload to ensure consistent ordering
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi lưu thứ tự");
    } finally {
      setOrderSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      slug: "",
      name: "",
      price: "",
      compareAtPrice: "",
      categoryId: "",
      templateId: "",
      images: [],
      sizes: "",
      colors: "",
      stockQuantity: "0",
      inStock: true,
      preOrder: false,
    });
    setEditingId(null);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({
      slug: p.slug,
      name: p.name,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
      categoryId:
        p.categoryId && typeof p.categoryId === "object"
          ? p.categoryId._id
          : "",
      templateId:
        p.templateId && typeof p.templateId === "object"
          ? p.templateId._id
          : "",
      images: p.images ?? [],
      sizes: (p.sizes ?? []).join(", "),
      colors: (p.colors ?? []).join(", "),
      stockQuantity: String(p.stockQuantity ?? 0),
      inStock: p.inStock ?? true,
      preOrder: p.preOrder ?? false,
    });
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      price: Number(form.price) || 0,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : 0,
      categoryId: form.categoryId || undefined,
      templateId: form.templateId || undefined,
      images: form.images,
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: form.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stockQuantity: Number(form.stockQuantity) || 0,
      inStock: form.inStock,
      preOrder: form.preOrder,
    };
    const isEdit = Boolean(editingId);
    const res = await adminFetch(
      isEdit ? `/admin/products/${editingId}` : "/admin/products",
      {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json().catch(() => ({}));
    setMessage(
      res.ok
        ? isEdit
          ? "Đã cập nhật."
          : "Đã thêm sản phẩm."
        : (data.message ?? "Lỗi"),
    );
    setSaving(false);
    if (res.ok) {
      resetForm();
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
    load();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploads = Array.from(files).map((file) => adminUploadFile(file));
      const results = await Promise.all(uploads);
      const urls = results.map((r) => r.url);
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      e.target.value = "";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  return (
    <>
      <h1 className="font-display mb-4 text-xl sm:text-2xl">Sản phẩm</h1>
      {editingId && (
        <p className="mb-4 text-sm text-accent">
          Đang sửa sản phẩm.{" "}
          <button
            type="button"
            onClick={resetForm}
            className="cursor-pointer rounded border border-border bg-transparent px-4 py-2 font-semibold text-muted"
          >
            Hủy
          </button>
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-lg border border-border bg-bg p-4"
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="hoodie-black"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tên *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Hoodie Black"
              required
              className={inputClass}
            />
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Giá (VNĐ) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="450000"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Giá so sánh (VNĐ)</label>
            <input
              type="number"
              value={form.compareAtPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, compareAtPrice: e.target.value }))
              }
              placeholder="550000"
              className={inputClass}
            />
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Danh mục</label>
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryId: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">-- Chọn Danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Mẫu Thông tin (Mô tả & Size Chart)
            </label>
            <select
              value={form.templateId}
              onChange={(e) =>
                setForm((f) => ({ ...f, templateId: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">-- Không dùng Mẫu --</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className={labelClass}>Ảnh</label>
          <div className="mb-2 flex items-center gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="text-sm"
            />
            {uploading && (
              <span className="text-sm text-muted">Đang upload...</span>
            )}
          </div>
          {form.images.length > 0 && (
            <>
              <p className="mb-1 mt-2 text-xs text-accent">
                💡 Kéo thả ảnh để sắp xếp thứ tự
              </p>
              <div
                ref={imagesContainerRef}
                className="mt-2 flex flex-wrap gap-2"
              >
                {form.images.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    data-url={url}
                    className="relative h-[100px] w-[100px] cursor-move overflow-hidden rounded border-2 border-border bg-surface transition-colors hover:border-accent"
                  >
                    <img
                      src={url}
                      alt=""
                      data-url={url}
                      className="h-full w-full object-cover pointer-events-none"
                    />
                    <div className="pointer-events-none absolute left-0.5 top-0.5 rounded bg-black/80 px-1 py-0.5 text-[10px] text-white select-none">
                      ⋮⋮
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute right-0.5 top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded border-none bg-red-600/90 text-xs text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className={labelClass}>Size (cách nhau dấu phẩy)</label>
            <input
              value={form.sizes}
              onChange={(e) =>
                setForm((f) => ({ ...f, sizes: e.target.value }))
              }
              placeholder="S,M,L,XL"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Màu (cách nhau dấu phẩy)</label>
            <input
              value={form.colors}
              onChange={(e) =>
                setForm((f) => ({ ...f, colors: e.target.value }))
              }
              placeholder="Đen,Trắng"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tồn kho</label>
            <input
              type="number"
              value={form.stockQuantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, stockQuantity: e.target.value }))
              }
              className={`${inputClass} w-24`}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="preOrder"
              checked={form.preOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, preOrder: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-accent mt-0.5"
            />
            <label
              htmlFor="preOrder"
              className="text-sm font-medium text-text cursor-pointer select-none"
            >
              Hàng Pre-order
            </label>
          </div>
        </div>
        <button type="submit" disabled={saving} className={btnPrimaryClass}>
          {saving
            ? editingId
              ? "Đang cập nhật..."
              : "Đang thêm..."
            : editingId
              ? "Cập nhật sản phẩm"
              : "Thêm sản phẩm"}
        </button>
        {message && <span className="ml-4 text-sm text-muted">{message}</span>}
      </form>
      {loading ? (
        <p className="text-muted">Đang tải...</p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm text-muted">
              💡 Kéo biểu tượng ↕ để sắp xếp thứ tự sản phẩm
            </span>
            <button
              type="button"
              disabled={!orderDirty || orderSaving}
              onClick={saveProductOrder}
              className={`rounded border-none px-4 py-2 font-semibold text-bg ${orderDirty ? "cursor-pointer bg-accent" : "cursor-not-allowed bg-border"} ${orderSaving ? "opacity-80" : ""}`}
            >
              {orderSaving ? "Đang lưu..." : "Lưu thứ tự"}
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="w-11 p-2"></th>
                <th className="p-2 text-left">Slug</th>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-right">Giá</th>
                <th className="p-2 text-left">Danh mục</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody ref={productsTbodyRef}>
              {products.map((p) => (
                <tr
                  key={p._id}
                  data-id={p._id}
                  className="border-b border-border"
                >
                  <td className="p-2">
                    <span
                      className="drag-handle inline-flex h-7 w-7 cursor-grab select-none items-center justify-center rounded-md border border-border bg-bg text-muted"
                      title="Kéo để sắp xếp"
                    >
                      ↕
                    </span>
                  </td>
                  <td className="p-2">{p.slug}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-right">
                    {new Intl.NumberFormat("vi-VN").format(p.price)}₫
                  </td>
                  <td className="p-2">
                    {p.categoryId && typeof p.categoryId === "object"
                      ? p.categoryId.name
                      : "-"}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      title="Sửa"
                      className="mr-2 inline-flex items-center justify-center rounded p-1.5 text-blue-500 hover:bg-blue-500/10 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      title="Xóa"
                      className="inline-flex items-center justify-center rounded p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

const labelClass = "mb-1 block text-xs text-muted";
const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base";
const btnPrimaryClass =
  "cursor-pointer rounded border-none bg-accent px-4 py-2 font-semibold text-bg";

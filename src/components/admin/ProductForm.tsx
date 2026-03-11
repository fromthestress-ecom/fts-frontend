"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { Category, ProductTemplate } from "@/lib/api";
import type Sortable from "sortablejs";
import { getAdminKey } from "./AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ProductFormValues = {
  slug: string;
  name: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  templateId: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stockQuantity: string;
  inStock: boolean;
  preOrder: boolean;
};

type ProductFormProps = {
  initialData?: Partial<ProductFormValues>;
  categories: Category[];
  templates: ProductTemplate[];
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  submitText: string;
};

export default function ProductForm({
  initialData,
  categories,
  templates,
  onSubmit,
  onCancel,
  isSaving,
  submitText,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>({
    slug: initialData?.slug ?? "",
    name: initialData?.name ?? "",
    price: initialData?.price ?? "",
    compareAtPrice: initialData?.compareAtPrice ?? "",
    categoryId: initialData?.categoryId ?? "",
    templateId: initialData?.templateId ?? "",
    images: initialData?.images ?? [],
    sizes: initialData?.sizes ?? [],
    colors: initialData?.colors ?? [],
    stockQuantity: initialData?.stockQuantity ?? "0",
    inStock: initialData?.inStock ?? true,
    preOrder: initialData?.preOrder ?? false,
  });

  const [uploading, setUploading] = useState(false);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [message, setMessage] = useState("");

  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

  // Initialize SortableJS
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
            const items = Array.from(imagesContainerRef.current?.children || []);
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

  const handleUploadFile = async (file: File) => {
    const key = getAdminKey();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/admin/upload`, {
      method: "POST",
      headers: {
        "x-admin-key": key ?? "",
      },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Upload thất bại");
    }
    return res.json();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage("");
    try {
      const uploads = Array.from(files).map((file) => handleUploadFile(file));
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

  const handleAddSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = sizeInput.trim();
      if (val && !form.sizes.includes(val)) {
        setForm((f) => ({ ...f, sizes: [...f.sizes, val] }));
      }
      setSizeInput("");
    }
  };

  const handleRemoveSize = (size: string) => {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s !== size) }));
  };

  const handleAddColor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = colorInput.trim();
      if (val && !form.colors.includes(val)) {
        setForm((f) => ({ ...f, colors: [...f.colors, val] }));
      }
      setColorInput("");
    }
  };

  const handleRemoveColor = (color: string) => {
    setForm((f) => ({ ...f, colors: f.colors.filter((c) => c !== color) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-sans">
      {message && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
          {message}
        </div>
      )}

      {/* Card 1: Thông tin cơ bản */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-border bg-bg/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-text">Thông tin cơ bản</h2>
          <p className="text-sm text-muted mt-1">
            Nhập tên, đường dẫn và danh mục cho sản phẩm.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-text">Tên sản phẩm *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Áo Hoodie Nỉ Bông Streetwear"
              required
              className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text">Đường dẫn tĩnh (Slug) *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="ao-hoodie-ni-bong"
              required
              className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
          <div className="hidden md:block"></div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text">Danh mục</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
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
            <label className="mb-2 block text-sm font-medium text-text">Mẫu Thông tin (Mô tả & Size Chart)</label>
            <select
              value={form.templateId}
              onChange={(e) => setForm({ ...form, templateId: e.target.value })}
              className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
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
      </div>

      {/* Card 2: Hình ảnh (Media) */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-border bg-bg/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-text">Hình ảnh sản phẩm</h2>
          <p className="text-sm text-muted mt-1">Định dạng JPG, PNG, WEBP. Kéo thả để sắp xếp lại thứ tự (Hình đầu tiên là hình chính).</p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-accent bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {uploading ? "Đang tải ảnh lên..." : "Tải ảnh từ máy tính"}
            </label>
          </div>
          
          {form.images.length > 0 ? (
            <div ref={imagesContainerRef} className="flex flex-wrap gap-4 mt-6">
              {form.images.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  data-url={url}
                  className="relative group h-32 w-32 cursor-move overflow-hidden rounded-lg border-2 border-border bg-bg transition-all hover:border-accent hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Ảnh ${idx + 1}`} data-url={url} className="h-full w-full object-cover pointer-events-none" />
                  {idx === 0 && (
                     <div className="absolute bottom-0 left-0 right-0 bg-accent/90 py-1 text-center text-[10px] uppercase font-bold text-bg pointer-events-none">
                       Ảnh chính
                     </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center mt-2">
              <div className="text-muted">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-50">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-sm">Chưa có hình ảnh nào. Hãy tải ảnh lên!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Thông tin bán hàng */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-border bg-bg/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-text">Thông tin bán hàng</h2>
          <p className="text-sm text-muted mt-1">Cấu hình giá cả, tồn kho và các biến thể phân loại hàng.</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Giá bán (VNĐ) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  className="w-full rounded-md border border-border bg-bg pl-4 pr-10 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">₫</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Giá bán gốc (Chưa giảm)</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full rounded-md border border-border bg-bg pl-4 pr-10 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">₫</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Tồn kho chung</label>
              <input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          <hr className="border-border my-6" />

          {/* Biến thể Size */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text mb-3">Tuỳ chọn Size</h3>
            <div className="bg-bg border border-border rounded-lg p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {form.sizes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-bg text-sm font-medium">
                    {s}
                    <button type="button" onClick={() => handleRemoveSize(s)} className="hover:text-black/50 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={handleAddSize}
                placeholder="Nhập size (VD: S, M, L) và nhấn Enter..."
                className="w-full bg-transparent border-none text-sm text-text focus:outline-none focus:ring-0 px-1"
              />
            </div>
          </div>

          {/* Biến thể Màu sắc */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text mb-3">Tuỳ chọn Màu sắc</h3>
             <div className="bg-bg border border-border rounded-lg p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {form.colors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-border text-text text-sm font-medium border border-[rgba(0,0,0,0.1)]">
                    {c}
                    <button type="button" onClick={() => handleRemoveColor(c)} className="hover:text-black/50 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={handleAddColor}
                placeholder="Nhập màu sắc (VD: Đen, Trắng) và nhấn Enter..."
                className="w-full bg-transparent border-none text-sm text-text focus:outline-none focus:ring-0 px-1"
              />
            </div>
          </div>

          <div className="mt-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={form.preOrder}
                  onChange={(e) => setForm({ ...form, preOrder: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-border bg-bg peer-checked:bg-accent peer-checked:border-accent transition-colors flex items-center justify-center group-hover:border-accent">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 peer-checked:opacity-100 transition-opacity absolute">
                      <polyline points="20 6 9 17 4 12" />
                   </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-text select-none group-hover:text-accent transition-colors">Sản phẩm Pre-order (Hàng đặt trước)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Hành động (Sticky Bottom) */}
      <div className="sticky bottom-0 z-40 bg-surface/80 backdrop-blur-md border-t border-border p-4 flex justify-end gap-3 shadow-lg rounded-t-xl mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-md border border-border bg-bg text-text font-medium text-sm hover:bg-surface transition-colors disabled:opacity-50"
        >
          Huỷ thao tác
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-2.5 rounded-md border border-transparent bg-accent text-bg font-medium text-sm hover:bg-accent/90 focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-75 flex items-center gap-2"
        >
          {isSaving && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {submitText}
        </button>
      </div>
    </form>
  );
}

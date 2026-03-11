"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";
import type { Category, ProductTemplate } from "@/lib/api";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Performs a fetch against the configured admin API, automatically adding a JSON Content-Type header and the admin key.
 *
 * @param path - The request path to append to the API base URL (e.g., `/admin/products`)
 * @param init - Optional fetch init; any provided headers are merged with the added `Content-Type` and `x-admin-key` headers
 * @returns The fetch `Response` promise
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
 * Render the admin "Create Product" page and manage its form lifecycle.
 *
 * Fetches categories and product templates when mounted, displays a product creation form,
 * posts the new product to the admin API on submit, and navigates back to the products list
 * on successful creation or when the user cancels.
 *
 * @returns The admin product creation page UI.
 */
export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resC, resT] = await Promise.all([
          adminFetch("/admin/categories"),
          adminFetch("/admin/templates"),
        ]);
        if (resC.ok) setCategories(await resC.json());
        if (resT.ok) setTemplates(await resT.json());
      } catch (err) {
        console.error("Lỗi tải dữ liệu", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (data: ProductFormValues) => {
    setSaving(true);
    try {
      const payload = {
        slug: data.slug.trim(),
        name: data.name.trim(),
        price: Number(data.price) || 0,
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : 0,
        categoryId: data.categoryId || undefined,
        templateId: data.templateId || undefined,
        images: data.images,
        sizes: data.sizes,
        colors: data.colors,
        stockQuantity: Number(data.stockQuantity) || 0,
        inStock: data.inStock,
        preOrder: data.preOrder,
      };

      const res = await adminFetch("/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message ?? "Lỗi thêm sản phẩm");
      }

      router.push("/admin/products");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi thêm sản phẩm");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (loading) {
    return <div className="p-4 text-center text-muted">Đang tải...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-text"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text">Thêm sản phẩm mới</h1>
          <p className="text-sm text-muted">
            Điền thông tin để tạo sản phẩm mới
          </p>
        </div>
      </div>

      <ProductForm
        categories={categories}
        templates={templates}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSaving={saving}
        submitText="Lưu sản phẩm"
      />
    </div>
  );
}

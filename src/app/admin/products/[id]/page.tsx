"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";
import type { Category, ProductTemplate } from "@/lib/api";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [initialData, setInitialData] = useState<Partial<ProductFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resP, resC, resT] = await Promise.all([
          adminFetch(`/admin/products/${id}`),
          adminFetch("/admin/categories"),
          adminFetch("/admin/templates"),
        ]);
        
        if (resC.ok) setCategories(await resC.json());
        if (resT.ok) setTemplates(await resT.json());
        
        if (resP.ok) {
          const product = await resP.json();
          setInitialData({
            slug: product.slug,
            name: product.name,
            price: String(product.price),
            compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
            categoryId: product.categoryId && typeof product.categoryId === "object" ? product.categoryId._id : (product.categoryId || ""),
            templateId: product.templateId && typeof product.templateId === "object" ? product.templateId._id : (product.templateId || ""),
            images: product.images ?? [],
            sizes: product.sizes ?? [],
            colors: product.colors ?? [],
            stockQuantity: String(product.stockQuantity ?? "0"),
            inStock: product.inStock ?? true,
            preOrder: product.preOrder ?? false,
          });
        } else {
          setError("Không tải được thông tin sản phẩm");
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu", err);
        setError("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadData();
    }
  }, [id]);

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

      const res = await adminFetch(`/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message ?? "Lỗi cập nhật sản phẩm");
      }

      router.push("/admin/products");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi cập nhật sản phẩm");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (loading) {
    return <div className="p-4 text-center text-muted">Đang tải thông tin sản phẩm...</div>;
  }

  if (error || !initialData) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="mb-4">{error || "Sản phẩm không tồn tại"}</p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-surface border border-border rounded text-text font-medium text-sm"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-text"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text">Sửa sản phẩm</h1>
          <p className="text-sm text-muted">Cập nhật thông tin cho sản phẩm hiện tại</p>
        </div>
      </div>

      <ProductForm
        initialData={initialData}
        categories={categories}
        templates={templates}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSaving={saving}
        submitText="Cập nhật sản phẩm"
      />
    </div>
  );
}

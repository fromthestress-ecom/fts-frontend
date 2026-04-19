"use client";

import { useEffect, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";
import type { ProductTemplate } from "@/lib/api";
import { ImageUploader } from "@/components/admin/ImageUploader";

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

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sizeChart: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/templates");
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", sizeChart: "" });
    setEditingId(null);
  };

  const handleEdit = (t: ProductTemplate) => {
    setEditingId(t._id);
    setForm({
      name: t.name,
      description: t.description ?? "",
      sizeChart: t.sizeChart ?? "",
    });
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      sizeChart: form.sizeChart.trim(),
    };
    const isEdit = Boolean(editingId);
    try {
      const res = await adminFetch(
        isEdit ? `/admin/templates/${editingId}` : "/admin/templates",
        {
          method: isEdit ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Lỗi");
      setMessage(isEdit ? "Đã cập nhật." : "Đã tạo template.");
      resetForm();
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Xóa mẫu này? Những sản phẩm đang dùng mẫu này sẽ bị mất hiển thị mô tả, bạn có chắc chắn?",
      )
    )
      return;
    try {
      await adminFetch(`/admin/templates/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  return (
    <>
      <h1 className="font-display mb-4 text-xl sm:text-2xl">
        Mẫu Mô Tả & Size Chart
      </h1>
      <p className="mb-6 text-sm text-muted">
        Tạo các Template (bản mẫu) chứa nội dung mô tả sản phẩm và hình ảnh bảng
        size. Sau khi tạo, bạn có thể gán các Template này cho nhiều sản phẩm
        khác nhau để tránh trùng lặp dữ liệu.
      </p>

      {editingId && (
        <p className="mb-4 text-sm text-accent">
          Đang sửa mẫu.{" "}
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
        <div className="mb-4">
          <label className={labelClass}>
            Tên Template (Dùng để phân biệt nội bộ) *
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ví dụ: Mẫu Áo Thun Local Brand"
            required
            className={inputClass}
          />
        </div>
        <div className="mb-4">
          <label className={labelClass}>Mô tả chung</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Chất liệu 100% Cotton, Form Boxy dập nổi..."
            rows={4}
            className={inputClass}
          />
        </div>
        <div className="mb-4">
          <ImageUploader
            label="Ảnh Size Chart"
            value={form.sizeChart}
            onChange={(url) => setForm((f) => ({ ...f, sizeChart: url }))}
            folder="size-chart"
            aspectHint="Bảng size — nên crop vuông hoặc tỉ lệ cố định"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={btnPrimaryClass}
        >
          {saving
            ? "Đang xử lý..."
            : editingId
              ? "Cập nhật Template"
              : "Tạo mới Template"}
        </button>
        {message && <span className="ml-4 text-sm text-accent">{message}</span>}
      </form>

      {loading ? (
        <p className="text-muted">Đang tải...</p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 w-1/4">Tên Mẫu</th>
              <th className="p-2 w-2/4">Mô tả trích xuất</th>
              <th className="p-2 w-1/4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t._id} className="border-b border-border">
                <td className="p-2 font-medium">{t.name}</td>
                <td className="p-2 text-muted">
                  <div className="line-clamp-2">
                    {t.description || (
                      <em className="text-xs">Không có mô tả</em>
                    )}
                  </div>
                  {t.sizeChart && (
                    <div className="mt-1 text-xs text-accent">
                      📎 Có ảnh Size Chart
                    </div>
                  )}
                </td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleEdit(t)}
                    className={`${btnPrimaryClass} mr-2`}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t._id)}
                    className="cursor-pointer rounded border-none bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted">
                  Bạn chưa tạo Template nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
}

const labelClass = "mb-1 block text-xs font-semibold text-muted";
const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-text text-sm focus:border-accent focus:outline-none";
const btnPrimaryClass =
  "cursor-pointer rounded border-none bg-accent px-4 py-2 font-semibold text-bg transition hover:opacity-90";

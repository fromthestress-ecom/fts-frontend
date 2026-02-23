"use client";

import { useEffect, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Category = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  order: number;
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

const inputClass =
  "rounded border border-border bg-bg px-3 py-2 text-text text-sm sm:text-base";

export default function AdminCategoriesPage() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminFetch("/admin/categories");
    if (res.ok) setList(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    const res = await adminFetch("/admin/categories", {
      method: "POST",
      body: JSON.stringify({ slug: slug.trim(), name: name.trim(), order }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Đã thêm." : (data.message ?? "Lỗi"));
    setSaving(false);
    if (res.ok) {
      setSlug("");
      setName("");
      setOrder(0);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này?")) return;
    await adminFetch(`/admin/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <h1 className="font-display mb-4 text-xl sm:text-2xl">Danh mục</h1>
      <form
        onSubmit={handleAdd}
        className="mb-6 flex flex-wrap items-end gap-2"
      >
        <div>
          <label className="mb-1 block text-xs text-muted">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ao-hoodie"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Áo Hoodie"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Thứ tự</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 0)}
            className={`${inputClass} w-20`}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded border-none bg-accent px-4 py-2 font-semibold text-bg"
        >
          {saving ? "Đang thêm..." : "Thêm danh mục"}
        </button>
        {message && (
          <span className="text-sm text-muted">{message}</span>
        )}
      </form>
      {loading ? (
        <p className="text-muted">Đang tải...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Thứ tự</th>
              <th className="p-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-border">
                <td className="p-2">{c.slug}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.order}</td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(c._id)}
                    className="rounded border-none bg-red-600 px-4 py-2 font-semibold text-white cursor-pointer"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

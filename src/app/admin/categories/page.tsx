"use client";

import { useEffect, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const NAV_GROUP_OPTIONS = ["", "Tops", "Bottoms", "Collections"] as const;

type Category = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  order: number;
  navGroup?: string;
  groupOrder?: number;
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
  const [navGroup, setNavGroup] = useState("");
  const [groupOrder, setGroupOrder] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      order,
      navGroup: navGroup.trim() || undefined,
      groupOrder,
    };
    if (editingId) {
      const res = await adminFetch(`/admin/categories/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(res.ok ? "Đã cập nhật." : (data.message ?? "Lỗi"));
      if (res.ok) {
        setEditingId(null);
        resetForm();
        load();
      }
    } else {
      const res = await adminFetch("/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(res.ok ? "Đã thêm." : (data.message ?? "Lỗi"));
      if (res.ok) {
        resetForm();
        load();
      }
    }
    setSaving(false);
  };

  const resetForm = () => {
    setSlug("");
    setName("");
    setOrder(0);
    setNavGroup("");
    setGroupOrder(0);
  };

  const startEdit = (c: Category) => {
    setEditingId(c._id);
    setSlug(c.slug);
    setName(c.name);
    setOrder(c.order ?? 0);
    setNavGroup(c.navGroup ?? "");
    setGroupOrder(c.groupOrder ?? 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
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
        <div>
          <label className="mb-1 block text-xs text-muted">Nhóm nav</label>
          <select
            value={navGroup}
            onChange={(e) => setNavGroup(e.target.value)}
            className={inputClass}
          >
            {NAV_GROUP_OPTIONS.map((opt) => (
              <option key={opt || "_"} value={opt}>
                {opt || "— Không —"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">
            Thứ tự trong nhóm
          </label>
          <input
            type="number"
            value={groupOrder}
            onChange={(e) => setGroupOrder(Number(e.target.value) || 0)}
            className={`${inputClass} w-24`}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded border-none bg-accent px-4 py-2 font-semibold text-bg"
        >
          {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm danh mục"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="cursor-pointer rounded border border-border px-4 py-2 text-sm"
          >
            Hủy
          </button>
        )}
        {message && <span className="text-sm text-muted">{message}</span>}
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
              <th className="p-2 text-left">Nhóm nav</th>
              <th className="p-2 text-left">Thứ tự nhóm</th>
              <th className="p-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-border">
                <td className="p-2">{c.slug}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.order}</td>
                <td className="p-2">{c.navGroup ?? "—"}</td>
                <td className="p-2">{c.groupOrder ?? 0}</td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
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
                    onClick={() => handleDelete(c._id)}
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
      )}
    </>
  );
}

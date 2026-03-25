"use client";

import { useState, useEffect } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Tag {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

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

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({ name: "", slug: "" });

  const fetchTags = async () => {
    try {
      const res = await adminFetch("/admin/tags");
      if (res.ok) {
        setTags(await res.json());
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const isAutoSlug =
      form.slug === "" || form.slug === generateSlug(form.name);
    setForm((f) => ({
      ...f,
      name,
      slug: isAutoSlug ? generateSlug(name) : f.slug,
    }));
  };

  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await adminFetch("/admin/tags", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create");
      setForm({ name: "", slug: "" });
      fetchTags();
      setMessage("Tạo Tag thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Xoá Tag "${name}"? Thao tác này sẽ gỡ Tag khỏi tất cả bài viết.`,
      )
    )
      return;
    try {
      const res = await adminFetch(`/admin/tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchTags();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-4 text-muted">Đang tải...</p>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="font-display text-xl sm:text-2xl uppercase tracking-wider mb-6">
        Quản lý Tags
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="md:col-span-1">
          <div className="bg-surface border border-border p-6 rounded-lg">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Tạo Tag Mới
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted uppercase tracking-wider">
                  Tên Tag *
                </label>
                <input
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  className="w-full rounded border border-border bg-bg px-3 py-2 text-sm focus:border-text outline-none"
                  placeholder="Streetwear"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted uppercase tracking-wider">
                  Đường dẫn (Slug) *
                </label>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  required
                  className="w-full rounded border border-border bg-bg px-3 py-2 text-sm focus:border-text outline-none text-muted"
                />
              </div>
              <button
                disabled={saving}
                className="w-full rounded bg-text text-bg font-bold uppercase text-xs tracking-widest py-2 hover:bg-accent hover:text-white transition-colors"
              >
                {saving ? "Đang xử lý..." : "Thêm Tag"}
              </button>
              {message && (
                <p className="text-xs font-bold text-green-500 mt-2">
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">
                    Tên Tag
                  </th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">
                    Slug
                  </th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs w-24">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-muted">
                      Chưa có Thẻ phân loại.
                    </td>
                  </tr>
                ) : (
                  tags.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b border-border hover:bg-bg/40 transition-colors"
                    >
                      <td className="p-4 font-semibold">#{t.name}</td>
                      <td className="p-4 text-muted font-mono text-xs">
                        {t.slug}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="text-red-500 hover:text-red-400 font-bold text-xs uppercase tracking-widest"
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

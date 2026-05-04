"use client";

import { useEffect, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Author = {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
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

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", avatar: "", bio: "" });

  const loadAuthors = async () => {
    try {
      const res = await adminFetch("/admin/authors");
      if (!res.ok) throw new Error("Không tải được danh sách tác giả");
      const body = (await res.json()) as Author[];
      setAuthors(body);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tải được danh sách tác giả",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await adminFetch("/admin/authors", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) throw new Error(body.message ?? "Không tạo được tác giả");

      setForm({ name: "", avatar: "", bio: "" });
      setMessage("Đã tạo tác giả mới.");
      loadAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được tác giả");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa tác giả "${name}"?`)) return;

    try {
      const res = await adminFetch(`/admin/authors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không xóa được tác giả");
      loadAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được tác giả");
    }
  };

  if (loading) {
    return <p className="p-4 text-muted">Đang tải...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <h1 className="mb-6 font-display text-xl uppercase tracking-wider sm:text-2xl">
        Quản lý Tác giả
      </h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-6 md:col-span-1">
          <h2 className="mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider">
            Tạo tác giả mới
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Tên tác giả
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="w-full rounded border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-text"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Avatar URL
              </label>
              <input
                value={form.avatar}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, avatar: e.target.value }))
                }
                className="w-full rounded border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-text"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Bio
              </label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="w-full rounded border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-text"
              />
            </div>

            {message ? <p className="text-sm text-green-500">{message}</p> : null}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded bg-text py-2 text-xs font-bold uppercase tracking-widest text-bg transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
            >
              {saving ? "Đang xử lý..." : "Thêm tác giả"}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-surface md:col-span-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="p-4 text-xs font-bold uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">
                  Bio
                </th>
                <th className="w-24 p-4 text-xs font-bold uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {authors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-muted">
                    Chưa có tác giả nào.
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr
                    key={author._id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-bg/40"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {author.avatar ? (
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="h-10 w-10 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg text-xs text-muted">
                            AU
                          </div>
                        )}
                        <span className="font-semibold">{author.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted">
                      {author.bio || "Chưa có mô tả"}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(author._id, author.name)}
                        className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400"
                      >
                        Xóa
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
  );
}

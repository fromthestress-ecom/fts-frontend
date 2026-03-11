"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminKey } from "@/components/admin/AdminGuard";
import type { BlogItem } from "@/lib/api";

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

type BlogListResponse = {
  blogs: BlogItem[];
  total: number;
  page: number;
  totalPages: number;
};

export default function AdminBlogsPage() {
  const [data, setData] = useState<BlogListResponse>({
    blogs: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async (page = 1) => {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) query.set("search", search);
    if (statusFilter) query.set("status", statusFilter);

    const res = await adminFetch(`/admin/blogs?${query.toString()}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này?")) return;
    await adminFetch(`/admin/blogs/${id}`, { method: "DELETE" });
    load(data.page);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl sm:text-2xl">Quản lý Blog</h1>
        <Link href="/admin/blogs/create" className={btnPrimaryClass}>
          + Viết bài mới
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Tìm tiêu đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} max-w-sm`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} max-w-[150px]`}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Đang tải...</p>
      ) : (
        <>
          <table className="w-full border-collapse bg-surface rounded-lg overflow-hidden border border-border">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted text-left">
                <th className="p-4 font-semibold">Tên bài viết</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold">Ngày đăng</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    Không có bài viết nào
                  </td>
                </tr>
              ) : (
                data.blogs.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-border hover:bg-border/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {b.thumbnail ? (
                          <img
                            src={b.thumbnail}
                            alt=""
                            className="w-12 h-12 object-cover rounded bg-bg border border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-bg border border-border rounded flex items-center justify-center text-muted text-xs">
                            Trống
                          </div>
                        )}
                        <div
                          className="font-semibold text-sm max-w-[200px] truncate"
                          title={b.title}
                        >
                          {b.title}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted">
                      {typeof b.categoryId === "object" && b.categoryId?.name
                        ? b.categoryId.name
                        : "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                          b.status === "published"
                            ? "bg-green-500/20 text-green-500 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                        }`}
                      >
                        {b.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted whitespace-nowrap">
                      {b.publishedAt
                        ? new Date(b.publishedAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Link
                        href={`/blogs/${b.slug}`}
                        target="_blank"
                        title="Xem"
                        className="mr-2 inline-flex items-center justify-center rounded p-1.5 text-muted hover:text-accent hover:bg-accent/10 transition-colors"
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
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/blogs/${b._id}`}
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
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(b._id)}
                        title="Xóa"
                        className="inline-flex items-center justify-center rounded p-1.5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                ))
              )}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => load(i + 1)}
                  className={`w-8 h-8 rounded border flex items-center justify-center font-semibold text-sm cursor-pointer transition-colors ${
                    data.page === i + 1
                      ? "border-text bg-text text-bg"
                      : "border-border bg-surface text-muted hover:border-text hover:text-text"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-text text-sm sm:text-base outline-none focus:border-accent transition-colors";
const btnPrimaryClass =
  "cursor-pointer rounded border border-text bg-text px-4 py-2 font-semibold text-bg hover:bg-bg hover:text-text transition-colors text-sm";

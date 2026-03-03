"use client";

import { useEffect, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AdminAffiliateSummary = {
  _id: string;
  status: string;
  commissionRate: number;
  walletBalance: number;
  pendingBalance: number;
  totalEarned: number;
};

type AdminUser = {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  referralCode: string;
  affiliateId?: AdminAffiliateSummary | null;
  createdAt?: string;
};

type AdminUserListResult = {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
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
  "rounded border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-text transition-colors";

const badgeBaseClass =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider";

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span
        className={`${badgeBaseClass} border-red-500/40 bg-red-500/10 text-red-500`}
      >
        Admin
      </span>
    );
  }
  if (role === "manager") {
    return (
      <span
        className={`${badgeBaseClass} border-blue-500/40 bg-blue-500/10 text-blue-500`}
      >
        Manager
      </span>
    );
  }
  return (
    <span
      className={`${badgeBaseClass} border-gray-500/40 bg-gray-500/10 text-gray-500`}
    >
      Customer
    </span>
  );
}

function AffiliateBadge({
  affiliate,
}: {
  affiliate: AdminAffiliateSummary | null | undefined;
}) {
  if (!affiliate) {
    return (
      <span
        className={`${badgeBaseClass} border-gray-400/40 bg-gray-400/10 text-gray-500`}
      >
        Chưa tham gia
      </span>
    );
  }

  const status = affiliate.status;
  let colorClass =
    "border-gray-500/40 bg-gray-500/10 text-gray-500" as string;
  let label = status;

  if (status === "active") {
    colorClass = "border-green-500/40 bg-green-500/10 text-green-500";
    label = "Đang hoạt động";
  } else if (status === "pending") {
    colorClass = "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";
    label = "Chờ duyệt";
  } else if (status === "rejected") {
    colorClass = "border-red-500/40 bg-red-500/10 text-red-500";
    label = "Đã từ chối";
  }

  return (
    <span className={`${badgeBaseClass} ${colorClass}`}>
      {label} · {affiliate.commissionRate}%
    </span>
  );
}

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminUserListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [affiliateFilter, setAffiliateFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const load = async (pageParam: number) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });
      if (search.trim()) query.append("search", search.trim());
      if (roleFilter) query.append("role", roleFilter);
      if (affiliateFilter) query.append("affiliate", affiliateFilter);

      const res = await adminFetch(`/admin/users?${query.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(body.message ?? "Không tải được danh sách user");
      }
      const body = (await res.json()) as AdminUserListResult;
      setData(body);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tải được danh sách user",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, affiliateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wider mb-1">
            Quản lý Người dùng
          </h1>
          <p className="text-sm text-muted">
            Xem danh sách người dùng, vai trò và trạng thái affiliate.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex flex-col gap-1.5"
        >
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Tìm kiếm (Tên, Email, SĐT)
          </label>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className={`flex-1 ${inputClass}`}
            />
            <button
              type="submit"
              className="bg-text text-bg px-4 py-2 rounded text-sm font-bold uppercase hover:bg-accent hover:text-white transition-colors"
            >
              Lọc
            </button>
          </div>
        </form>

        <div className="w-full md:w-44 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Vai trò
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">Tất cả</option>
            <option value="customer">Customer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="w-full md:w-52 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Affiliate
          </label>
          <select
            value={affiliateFilter}
            onChange={(e) => {
              setAffiliateFilter(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">Tất cả</option>
            <option value="has">Có affiliate</option>
            <option value="none">Chưa tham gia</option>
            <option value="active">Đang hoạt động</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg/50 border-b border-border">
            <tr>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Họ tên
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Liên hệ
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Vai trò
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Mã giới thiệu
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Affiliate
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Ngày tạo
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : !data || data.users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              data.users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-border last:border-0 hover:bg-bg/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-semibold text-text">
                      {u.fullName || "—"}
                    </div>
                    <div className="text-xs text-muted">
                      ID:{" "}
                      <span className="font-mono">
                        {u._id.slice(0, 6)}…
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-text">{u.email}</div>
                    {u.phone && (
                      <div className="text-xs text-muted">{u.phone}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="p-4 text-sm">
                    {u.referralCode ? (
                      <span className="font-mono text-xs bg-bg px-2 py-1 rounded border border-border">
                        {u.referralCode}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <AffiliateBadge affiliate={u.affiliateId ?? null} />
                  </td>
                  <td className="p-4 text-xs text-muted">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-bg/30">
            <span className="text-sm text-muted">
              Hiển thị trang{" "}
              <span className="font-bold text-text">{data.page}</span> /{" "}
              {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page === 1}
                className="rounded border border-border bg-bg px-3 py-1.5 text-sm hover:border-text transition-colors disabled:opacity-50"
              >
                Trang trước
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={data.page === data.totalPages}
                className="rounded border border-border bg-bg px-3 py-1.5 text-sm hover:border-text transition-colors disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


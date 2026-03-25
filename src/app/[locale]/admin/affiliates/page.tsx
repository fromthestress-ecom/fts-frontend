"use client";

import { useEffect, useState } from "react";
import { getAdminKey } from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AdminAffiliate = {
  _id: string;
  code: string;
  status: string;
  commissionRate: number;
  walletBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalOrders?: number;
  createdAt?: string;
  userId?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
};

type AdminAffiliateListResult = {
  items: AdminAffiliate[];
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

function AffiliateStatusBadge({ status }: { status: string }) {
  let colorClass = "border-gray-500/40 bg-gray-500/10 text-gray-500" as string;
  let label = status;

  if (status === "active") {
    colorClass = "border-green-500/40 bg-green-500/10 text-green-500";
    label = "Đang hoạt động";
  } else if (status === "pending") {
    colorClass = "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";
    label = "Chờ duyệt";
  } else if (status === "suspended") {
    colorClass = "border-orange-500/40 bg-orange-500/10 text-orange-500";
    label = "Tạm khóa";
  }

  return <span className={`${badgeBaseClass} ${colorClass}`}>{label}</span>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminAffiliatesPage() {
  const [data, setData] = useState<AdminAffiliateListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
      if (statusFilter) query.append("status", statusFilter);

      const res = await adminFetch(`/admin/affiliates?${query.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(body.message ?? "Không tải được danh sách affiliate");
      }
      const body = (await res.json()) as AdminAffiliateListResult;
      setData(body);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách affiliate",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const handleApprove = async (affiliateId: string) => {
    const confirmed = window.confirm(
      'Duyệt affiliate này chuyển sang trạng thái "Đang hoạt động"?',
    );
    if (!confirmed) return;
    try {
      const res = await adminFetch(`/admin/affiliates/${affiliateId}/approve`, {
        method: "PATCH",
      });
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) {
        throw new Error(body.message ?? "Không duyệt được affiliate");
      }
      load(page);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không duyệt được affiliate",
      );
    }
  };

  const handleToggleSuspend = async (
    affiliateId: string,
    currentStatus: string,
  ) => {
    const toSuspend = currentStatus !== "suspended";
    const confirmed = window.confirm(
      toSuspend
        ? 'Tạm khóa affiliate này?'
        : 'Mở khóa affiliate này về trạng thái "Đang hoạt động"?',
    );
    if (!confirmed) return;
    try {
      const endpoint = toSuspend ? "suspend" : "approve";
      const res = await adminFetch(
        `/admin/affiliates/${affiliateId}/${endpoint}`,
        {
          method: "PATCH",
        },
      );
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) {
        throw new Error(body.message ?? "Không cập nhật được trạng thái");
      }
      load(page);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Không cập nhật được trạng thái affiliate",
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wider mb-1">
            Quản lý Affiliate
          </h1>
          <p className="text-sm text-muted">
            Theo dõi đối tác affiliate, doanh thu và trạng thái duyệt.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex flex-col gap-1.5"
        >
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Tìm kiếm (Tên, Email, Mã affiliate)
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

        <div className="w-full md:w-52 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Tạm khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg/50 border-b border-border">
            <tr>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Affiliate
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Chủ tài khoản
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Trạng thái
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Hoa hồng
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Số dư
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">
                Hành động
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
            ) : !data || data.items?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  Chưa có affiliate nào.
                </td>
              </tr>
            ) : (
              data.items?.map((a) => (
                <tr
                  key={a._id}
                  className="border-b border-border last:border-0 hover:bg-bg/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-mono text-xs bg-bg px-2 py-1 rounded border border-border inline-block">
                      {a.code}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      ID:{" "}
                      <span className="font-mono">{a._id.slice(0, 6)}…</span>
                    </div>
                    {typeof a.totalOrders === "number" && (
                      <div className="text-xs text-muted mt-1">
                        Đơn hàng:{" "}
                        <span className="font-semibold">{a.totalOrders}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-text">
                      {a.userId?.fullName ?? "—"}
                    </div>
                    <div className="text-xs text-muted">
                      {a.userId?.email ?? ""}
                    </div>
                    {a.userId?.phone && (
                      <div className="text-xs text-muted">{a.userId.phone}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <AffiliateStatusBadge status={a.status} />
                  </td>
                  <td className="p-4 text-sm">{a.commissionRate}%</td>
                  <td className="p-4 text-xs">
                    <div className="text-accent font-semibold">
                      {formatCurrency(a.walletBalance ?? 0)}
                    </div>
                    <div className="text-muted">
                      Chờ duyệt: {formatCurrency(a.pendingBalance ?? 0)}
                    </div>
                    <div className="text-muted">
                      Tổng kiếm được: {formatCurrency(a.totalEarned ?? 0)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      {a.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleApprove(a._id)}
                          className="rounded border-none bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 cursor-pointer"
                        >
                          Duyệt
                        </button>
                      )}
                      {a.status === "active" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleSuspend(a._id, a.status)
                          }
                          className="rounded border-none bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 cursor-pointer"
                        >
                          Tạm khóa
                        </button>
                      )}
                      {a.status === "suspended" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleSuspend(a._id, a.status)
                          }
                          className="rounded border-none bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 cursor-pointer"
                        >
                          Mở khóa
                        </button>
                      )}
                    </div>
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
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
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

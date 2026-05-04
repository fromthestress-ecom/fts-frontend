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

type CreateMarketingForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
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
  "rounded border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-text";

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

  if (role === "marketing") {
    return (
      <span
        className={`${badgeBaseClass} border-pink-500/40 bg-pink-500/10 text-pink-500`}
      >
        Marketing
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
  let colorClass = "border-gray-500/40 bg-gray-500/10 text-gray-500";
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
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState<CreateMarketingForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

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

  const handleCreateMarketing = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    setCreateMessage("");

    try {
      const res = await adminFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          ...createForm,
          role: "marketing",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!res.ok) {
        throw new Error(body.message ?? "Không tạo được tài khoản marketing");
      }

      setCreateForm({ fullName: "", email: "", phone: "", password: "" });
      setCreateMessage("Đã tạo tài khoản marketing thành công.");
      setPage(1);
      load(1);
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Không tạo được tài khoản marketing",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-display text-2xl uppercase tracking-wider">
            Quản lý Người dùng
          </h1>
          <p className="text-sm text-muted">
            Tạo account marketing và theo dõi vai trò của người dùng trong hệ
            thống.
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.1fr,1.6fr]">
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
            Tạo tài khoản marketing
          </h2>
          <p className="mb-4 text-sm text-muted">
            Role này chỉ dùng được nhóm content, không vào AI, báo cáo hay quản
            lý sản phẩm.
          </p>

          <form onSubmit={handleCreateMarketing} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Họ tên
              </label>
              <input
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                required
                className={`w-full ${inputClass}`}
                placeholder="Nguyen Van A"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Email
              </label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
                className={`w-full ${inputClass}`}
                placeholder="marketing@fromthestress.vn"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Số điện thoại
              </label>
              <input
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className={`w-full ${inputClass}`}
                placeholder="090..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Mật khẩu tạm
              </label>
              <input
                type="password"
                minLength={8}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
                className={`w-full ${inputClass}`}
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>

            {createError ? (
              <p className="text-sm text-red-500">{createError}</p>
            ) : null}
            {createMessage ? (
              <p className="text-sm text-green-500">{createMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded bg-text px-4 py-2 text-sm font-bold uppercase text-bg transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
            >
              {creating ? "Đang tạo..." : "Tạo account marketing"}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider">
            Gợi ý vận hành
          </div>
          <ul className="space-y-2 text-sm text-muted">
            <li>Marketing chỉ thấy các màn blog, media, tag, tác giả và danh mục blog.</li>
            <li>AI Writer, Auto Crawl, dashboard báo cáo và user management đều bị chặn.</li>
            <li>Xóa sản phẩm cũng bị chặn từ cả giao diện lẫn API.</li>
          </ul>
        </div>
      </div>

      <div className="mb-8 flex flex-col items-end gap-4 rounded-lg border border-border bg-surface p-6 md:flex-row">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 flex-col gap-1.5"
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
              className="rounded bg-text px-4 py-2 text-sm font-bold uppercase text-bg transition-colors hover:bg-accent hover:text-white"
            >
              Lọc
            </button>
          </div>
        </form>

        <div className="flex w-full flex-col gap-1.5 md:w-44">
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
            <option value="marketing">Marketing</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex w-full flex-col gap-1.5 md:w-52">
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

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="border-b border-border bg-bg/50">
            <tr>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">
                Họ tên
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">
                Vai trò
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">
                Mã giới thiệu
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">
                Affiliate
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">
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
              data.users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-bg/30"
                >
                  <td className="p-4">
                    <div className="font-semibold text-text">
                      {user.fullName || "—"}
                    </div>
                    <div className="text-xs text-muted">
                      ID: <span className="font-mono">{user._id.slice(0, 6)}…</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-text">{user.email}</div>
                    {user.phone ? (
                      <div className="text-xs text-muted">{user.phone}</div>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="p-4 text-sm">
                    {user.referralCode ? (
                      <span className="rounded border border-border bg-bg px-2 py-1 font-mono text-xs">
                        {user.referralCode}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <AffiliateBadge affiliate={user.affiliateId ?? null} />
                  </td>
                  <td className="p-4 text-xs text-muted">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-border bg-bg/30 p-4">
            <span className="text-sm text-muted">
              Hiển thị trang <span className="font-bold text-text">{data.page}</span> /{" "}
              {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={data.page === 1}
                className="rounded border border-border bg-bg px-3 py-1.5 text-sm transition-colors hover:border-text disabled:opacity-50"
              >
                Trang trước
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(data.totalPages, current + 1))
                }
                disabled={data.page === data.totalPages}
                className="rounded border border-border bg-bg px-3 py-1.5 text-sm transition-colors hover:border-text disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

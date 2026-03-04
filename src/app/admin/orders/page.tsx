"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminKey } from "@/components/admin/AdminGuard";
import type { Order, OrderListResult } from "@/lib/api";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  let colorClass = "bg-gray-500/10 text-gray-500 border-gray-500/20";
  let label = status.toUpperCase();

  switch (status) {
    case "pending":
      colorClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      label = "CHỜ XỬ LÝ";
      break;
    case "processing":
      colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      label = "ĐANG XỬ LÝ";
      break;
    case "shipped":
      colorClass = "bg-purple-500/10 text-purple-500 border-purple-500/20";
      label = "ĐANG GIAO";
      break;
    case "delivered":
      colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
      label = "ĐÃ GIAO";
      break;
    case "cancelled":
      colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
      label = "ĐÃ HỦY";
      break;
  }

  return (
    <span
      className={`px-2 py-1 text-[10px] sm:text-xs font-bold tracking-wider rounded border ${colorClass}`}
    >
      {label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrderListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) q.append("search", search);
      if (statusFilter) q.append("status", statusFilter);

      const res = await adminFetch(`/admin/orders?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const inputClass =
    "rounded border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-text transition-colors";

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wider mb-1">
            Quản lý Đơn hàng
          </h1>
          <p className="text-sm text-muted">
            Theo dõi và xử lý tiến trình giao hàng
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex flex-col gap-1.5"
        >
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Tìm kiếm (Mã đơn, SDT, Email)
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

        <div className="w-full md:w-48 flex flex-col gap-1.5">
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
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg/50 border-b border-border">
            <tr>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Mã Đơn
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Ngày đặt
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Khách hàng
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Tổng tiền
              </th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">
                Trạng thái
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
            ) : !data || data.orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            ) : (
              data.orders.map((o) => (
                <tr
                  key={o._id}
                  className="border-b border-border last:border-0 hover:bg-bg/30 transition-colors"
                >
                  <td className="p-4 font-mono text-text">
                    <Link
                      href={`/admin/orders/${o.orderNumber}`}
                      className="hover:text-accent underline underline-offset-2 font-semibold"
                    >
                      #{o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-muted">
                    {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-text">
                      {o.shippingAddress.fullName}
                    </div>
                    <div className="text-xs text-muted">
                      {o.shippingAddress.phone}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-accent">
                    {formatCurrency(
                      (o.subtotal || 0) -
                        (o.discount || 0) +
                        (o.shippingFee || 0),
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={o.status || "pending"} />
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/orders/${o.orderNumber}`}
                      className="text-xs tracking-widest font-bold uppercase text-muted hover:text-text transition-colors"
                    >
                      Chi tiết →
                    </Link>
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page === 1}
                className="rounded border border-border bg-bg px-3 py-1.5 text-sm hover:border-text transition-colors disabled:opacity-50"
              >
                Trang trước
              </button>
              <button
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

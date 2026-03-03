"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getAdminKey } from "@/components/admin/AdminGuard";
import type { Order } from "@/lib/api";

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

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/admin/orders/${id}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
      setStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || status === order.status) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await adminFetch(`/admin/orders/${order._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setOrder(data.order);
      setStatus(data.order.status);
      setMessage("Cập nhật trạng thái thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage("Lỗi: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted p-4">Đang tải chi tiết đơn hàng...</p>;
  }

  if (!order) {
    return (
      <div className="p-4">
        <p className="text-red-500 mb-4 font-bold">Không tìm thấy đơn hàng.</p>
        <Link href="/admin/orders" className="text-accent underline text-sm">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const inputClass =
    "rounded border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-text transition-colors";

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="text-muted hover:text-text transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-xl sm:text-2xl uppercase tracking-wider flex items-center gap-3">
            Đơn Hàng #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted mt-1">
            Đặt ngày: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Items & Note) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Chi tiết sản phẩm
            </h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border-b border-border last:border-0 pb-4 last:pb-0"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover border border-border rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-bg border border-border rounded flex items-center justify-center text-xs text-muted">
                      No Image
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate text-text">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      {item.size && `Size: ${item.size}`}{" "}
                      {item.size && item.color && "|"}{" "}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(item.price)}{" "}
                      <span className="text-muted text-xs px-1">x</span>{" "}
                      {item.quantity}
                    </p>
                    <p className="text-xs text-accent mt-1 tracking-wider font-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.note && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-yellow-500 mb-2">
                Ghi chú của khách
              </h2>
              <p className="text-sm italic text-muted">"{order.note}"</p>
            </div>
          )}
        </div>

        {/* Right Column (Status, Customer, Total) */}
        <div className="flex flex-col gap-6">
          {/* Actions / Status */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Trạng thái đơn
            </h2>
            <div className="flex flex-col gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={saving || status === order.status}
                className="w-full bg-text text-bg font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
              >
                {saving ? "Đang xử lý..." : "Cập nhật trạng thái"}
              </button>
              {message && (
                <p
                  className={`text-xs font-bold text-center mt-2 ${message.includes("Lỗi") ? "text-red-500" : "text-green-500"}`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Address */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Giao Hàng
            </h2>
            <div className="text-sm flex flex-col gap-2 text-muted">
              <p>
                <strong className="text-text font-semibold uppercase text-xs tracking-wider">
                  Người nhận:
                </strong>{" "}
                <br />
                {order.shippingAddress.fullName}
              </p>
              <p>
                <strong className="text-text font-semibold uppercase text-xs tracking-wider">
                  Số điện thoại:
                </strong>{" "}
                <br />
                {order.shippingAddress.phone}
              </p>
              <p>
                <strong className="text-text font-semibold uppercase text-xs tracking-wider">
                  Email:
                </strong>{" "}
                <br />
                {order.email}
              </p>
              <p>
                <strong className="text-text font-semibold uppercase text-xs tracking-wider">
                  Địa chỉ:
                </strong>{" "}
                <br />
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.ward &&
                  `${order.shippingAddress.ward}, `}
                {order.shippingAddress.district &&
                  `${order.shippingAddress.district}, `}
                {order.shippingAddress.city && order.shippingAddress.city}
              </p>
            </div>
          </div>

          {/* Total Summaries */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">
              Thanh Toán
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Phí giao hàng</span>
                <span>
                  {order.shippingFee === 0
                    ? "Freeship"
                    : formatCurrency(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-accent text-lg pt-3 border-t border-border">
                <span>Tổng cộng</span>
                <span>
                  {formatCurrency(order.subtotal + order.shippingFee)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

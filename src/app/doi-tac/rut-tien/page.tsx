"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  note?: string;
  createdAt: string;
}

interface WithdrawalResult {
  items: Withdrawal[];
  total: number;
  page: number;
  totalPages: number;
}

interface DashboardData {
  walletBalance: number;
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function RutTienPage() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState<WithdrawalResult | null>(null);
  const [page, setPage] = useState(1);

  const loadData = () => {
    if (!token) return;
    fetchApi<DashboardData>("/affiliates/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((d) => setBalance(d.walletBalance));

    fetchApi<WithdrawalResult>(
      `/affiliates/withdrawals?page=${page}&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ).then(setData);
  };

  useEffect(() => {
    loadData();
  }, [token, page]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await fetchApi("/affiliates/withdraw", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      setSuccess("Yêu cầu rút tiền đã được gửi!");
      setAmount("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="affiliate-content__title">Rút Tiền</h1>

      {/* Balance */}
      <div className="affiliate-stat-card affiliate-stat-card--accent mb-6 max-w-sm">
        <p className="affiliate-stat-card__label">Số dư có thể rút</p>
        <p className="affiliate-stat-card__value text-3xl font-display">
          {formatVND(balance)}
        </p>
      </div>

      {/* Withdraw Form */}
      <form
        onSubmit={handleWithdraw}
        className="bg-surface border border-border rounded-xl p-6 mb-8 max-w-xl"
      >
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4">
          Tạo Yêu Cầu Rút
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded text-green-500 text-sm">
            {success}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-muted mb-2">
            Số tiền muốn rút (VNĐ)
          </label>
          <input
            type="number"
            min={100000}
            max={balance}
            step={1000}
            placeholder="VD: 500000 (Tối thiểu 100.000đ)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-text transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={
            submitting ||
            !amount ||
            Number(amount) < 100000 ||
            Number(amount) > balance
          }
          className="w-full bg-text text-bg font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {submitting ? "Đang xử lý..." : "Gửi Yêu Cầu"}
        </button>
      </form>

      {/* History */}
      <h2 className="text-xl font-bold uppercase tracking-wider mb-4">
        Lịch sử rút tiền
      </h2>

      {!data ? (
        <p className="text-muted">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <div className="p-8 border border-dashed border-border rounded-xl text-center">
          <p className="text-muted">Bạn chưa có lịch sử rút tiền nào.</p>
        </div>
      ) : (
        <>
          <div className="affiliate-table-wrapper">
            <table className="affiliate-table">
              <thead>
                <tr>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((w) => (
                  <tr key={w._id}>
                    <td className="font-semibold text-text">
                      {formatVND(w.amount)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          w.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                            : w.status === "completed"
                              ? "bg-green-500/20 text-green-500 border border-green-500/30"
                              : "bg-red-500/20 text-red-500 border border-red-500/30"
                        }`}
                      >
                        {w.status === "pending" && "Chờ duyệt"}
                        {w.status === "completed" && "Hoàn thành"}
                        {w.status === "rejected" && "Từ chối"}
                      </span>
                    </td>
                    <td className="text-muted max-w-[200px] truncate">
                      {w.note || "—"}
                    </td>
                    <td className="text-muted">
                      {new Date(w.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="affiliate-pagination mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span className="text-muted px-4 py-2 text-sm">
                Trang {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

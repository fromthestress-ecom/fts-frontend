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
      <h1 className="affiliate-content__title">Rút tiền</h1>

      {/* Balance */}
      <div
        className="affiliate-stat-card"
        style={{ marginBottom: "1.5rem", maxWidth: 320 }}
      >
        <p className="affiliate-stat-card__label">Số dư khả dụng</p>
        <p className="affiliate-stat-card__value affiliate-stat-card__value--accent">
          {formatVND(balance)}
        </p>
      </div>

      {/* Withdraw Form */}
      <form onSubmit={handleWithdraw} className="affiliate-withdraw-form">
        <input
          type="number"
          min={100000}
          max={balance}
          step={1000}
          placeholder="Nhập số tiền (tối thiểu 100.000đ)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting || !amount}>
          {submitting ? "Đang gửi..." : "Rút tiền"}
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "#ef4444",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          style={{
            color: "#22c55e",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {success}
        </p>
      )}

      {/* History */}
      <h2
        className="affiliate-content__title"
        style={{ fontSize: "1.3rem", marginTop: "2rem" }}
      >
        Lịch sử rút tiền
      </h2>

      {!data ? (
        <p className="text-muted">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <p className="text-muted">Chưa có lịch sử rút tiền.</p>
      ) : (
        <>
          <div className="affiliate-table-wrap">
            <table className="affiliate-table">
              <thead>
                <tr>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((w) => (
                  <tr key={w._id}>
                    <td>{formatVND(w.amount)}</td>
                    <td>
                      <span
                        className={`affiliate-badge affiliate-badge--${w.status}`}
                      >
                        {w.status === "pending" && "Chờ duyệt"}
                        {w.status === "completed" && "Hoàn thành"}
                        {w.status === "rejected" && "Từ chối"}
                      </span>
                    </td>
                    <td>{w.note || "—"}</td>
                    <td>{new Date(w.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="affiliate-pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span
                className="text-muted"
                style={{ padding: "0.4rem 0.5rem", fontSize: "0.8rem" }}
              >
                {page} / {data.totalPages}
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

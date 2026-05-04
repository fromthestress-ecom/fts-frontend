"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  setAdminKey,
  setAdminProfile,
  type AdminProfile,
} from "@/components/admin/AdminGuard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loadingMode, setLoadingMode] = useState<"credentials" | "api-key" | "">(
    "",
  );

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingMode("credentials");

    try {
      const res = await fetch(`${API}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        accessToken?: string;
        admin?: AdminProfile;
        message?: string;
      };

      if (res.ok && data.accessToken && data.admin) {
        setAdminKey(data.accessToken);
        setAdminProfile(data.admin);
        router.replace("/admin");
        return;
      }

      setError(data.message ?? "Đăng nhập thất bại");
    } catch {
      setError("Không kết nối được server");
    } finally {
      setLoadingMode("");
    }
  };

  const handleApiKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingMode("api-key");

    try {
      const res = await fetch(`${API}/admin/auth/verify`, {
        method: "POST",
        headers: { "x-admin-key": apiKey },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        admin?: AdminProfile;
        message?: string;
      };

      if (res.ok && data.ok && data.admin) {
        setAdminKey(apiKey);
        setAdminProfile(data.admin);
        router.replace("/admin");
        return;
      }

      setError(data.message ?? "Sai API key");
    } catch {
      setError("Không kết nối được server");
    } finally {
      setLoadingMode("");
    }
  };

  return (
    <div className="mx-auto max-w-[420px] px-8 py-8 sm:py-16">
      <h1 className="font-display mb-2 text-xl sm:text-2xl">Admin đăng nhập</h1>
      <p className="mb-6 text-sm text-muted">
        Tài khoản `marketing` sẽ chỉ nhìn thấy nhóm tính năng content.
      </p>

      <form onSubmit={handleCredentialLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email admin"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-text"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-text"
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={loadingMode !== ""}
          className="w-full rounded-lg border-none bg-accent py-3 font-bold text-bg disabled:opacity-70"
        >
          {loadingMode === "credentials" ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>

      <div className="my-6 h-px bg-border" />

      <form onSubmit={handleApiKeyLogin} className="space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted">
          Hoặc dùng API key hệ thống
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Admin API key"
          className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-text"
        />
        <button
          type="submit"
          disabled={loadingMode !== "" || !apiKey.trim()}
          className="w-full rounded-lg border border-border bg-transparent py-3 font-bold text-text disabled:opacity-50"
        >
          {loadingMode === "api-key" ? "Đang kiểm tra..." : "Dùng API key"}
        </button>
      </form>
    </div>
  );
}

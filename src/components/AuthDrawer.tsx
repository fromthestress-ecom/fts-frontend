"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "login" | "register";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regReferralCode, setRegReferralCode] = useState("");

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        email: regEmail,
        password: regPassword,
        fullName: regFullName,
        phone: regPhone || undefined,
        referredByCode: regReferralCode || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] bg-black/70 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`auth-drawer fixed inset-y-0 right-0 z-[201] w-[min(100vw,420px)] flex flex-col bg-bg shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="auth-drawer__title m-0">
            {tab === "login" ? "Đăng nhập" : "Đăng ký"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-transparent text-muted transition-colors hover:border-text hover:text-text"
            aria-label="Đóng"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="auth-drawer__tabs">
          <button
            type="button"
            className={`auth-drawer__tab ${tab === "login" ? "auth-drawer__tab--active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`auth-drawer__tab ${tab === "register" ? "auth-drawer__tab--active" : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Đăng ký
          </button>
        </div>

        {/* Error */}
        {error && <div className="auth-drawer__error">{error}</div>}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="auth-drawer__form">
              <div className="auth-drawer__field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="login-password">Mật khẩu</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="auth-drawer__submit"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-drawer__form">
              <div className="auth-drawer__field">
                <label htmlFor="reg-name">Họ tên *</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="From the Stress"
                  autoComplete="name"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="reg-email">Email *</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="reg-password">Mật khẩu *</label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="reg-phone">Số điện thoại</label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0912 345 678"
                  autoComplete="tel"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="reg-referral">Mã giới thiệu</label>
                <input
                  id="reg-referral"
                  type="text"
                  value={regReferralCode}
                  onChange={(e) =>
                    setRegReferralCode(e.target.value.toUpperCase())
                  }
                  placeholder="VD: FTS_YOUR_NAME"
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <button
                type="submit"
                className="auth-drawer__submit"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

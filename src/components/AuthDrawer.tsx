"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from 'next-intl';

type Tab = "login" | "register" | "forgot_password";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const t = useTranslations('auth');
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regReferralCode, setRegReferralCode] = useState("");

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setForgotMessage("");
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
      setError(err instanceof Error ? err.message : t('genericError'));
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotMessage("");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('genericError'));
      setForgotMessage(data.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-200 bg-black/70 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`auth-drawer fixed inset-y-0 right-0 z-201 w-[min(100vw,420px)] flex flex-col bg-bg shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="auth-drawer__title m-0">
            {tab === "login"
              ? t('loginTitle')
              : tab === "register"
                ? t('registerTitle')
                : t('forgotTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-transparent text-muted transition-colors hover:border-text hover:text-text"
            aria-label={t('close')}
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
        {tab !== "forgot_password" && (
          <div className="auth-drawer__tabs">
            <button
              type="button"
              className={`auth-drawer__tab ${tab === "login" ? "auth-drawer__tab--active" : ""}`}
              onClick={() => {
                setTab("login");
                setError("");
                setForgotMessage("");
              }}
            >
              {t('loginTitle')}
            </button>
            <button
              type="button"
              className={`auth-drawer__tab ${tab === "register" ? "auth-drawer__tab--active" : ""}`}
              onClick={() => {
                setTab("register");
                setError("");
                setForgotMessage("");
              }}
            >
              {t('registerTitle')}
            </button>
          </div>
        )}

        {/* Error */}
        {error && <div className="auth-drawer__error">{error}</div>}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="auth-drawer__form">
              <div className="auth-drawer__field">
                <label htmlFor="login-email">{t('emailLabel')}</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="login-password">{t('passwordLabel')}</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="current-password"
                />
              </div>

              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setTab("forgot_password");
                    setError("");
                    setForgotMessage("");
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  {t('forgotLink')}
                </button>
              </div>

              <button
                type="submit"
                className="auth-drawer__submit"
                disabled={loading}
              >
                {loading ? t('processing') : t('loginTitle')}
              </button>
            </form>
          ) : tab === "forgot_password" ? (
            <form onSubmit={handleForgotPassword} className="auth-drawer__form">
              <p className="mb-4 text-sm text-text/70">
                {t('forgotDesc')}
              </p>
              <div className="auth-drawer__field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              {forgotMessage && (
                <div className="mb-4 text-sm text-green-500">
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                className="auth-drawer__submit"
                disabled={loading}
              >
                {loading ? t('processing') : t('sendRequest')}
              </button>

              <button
                type="button"
                className="mt-4 w-full text-center text-sm text-text/70 hover:text-text"
                onClick={() => {
                  setTab("login");
                  setError("");
                  setForgotMessage("");
                }}
              >
                {t('backToLogin')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-drawer__form">
              <div className="auth-drawer__field">
                <label htmlFor="reg-name">{t('fullName')}</label>
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
                <label htmlFor="reg-email">{t('emailRequired')}</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="reg-password">{t('passwordRequired')}</label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder={t('passwordMin')}
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="reg-phone">{t('phone')}</label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  autoComplete="tel"
                />
              </div>

              <div className="auth-drawer__field">
                <label htmlFor="reg-referral">{t('referralCode')}</label>
                <input
                  id="reg-referral"
                  type="text"
                  value={regReferralCode}
                  onChange={(e) =>
                    setRegReferralCode(e.target.value.toUpperCase())
                  }
                  placeholder={t('referralPlaceholder')}
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <button
                type="submit"
                className="auth-drawer__submit"
                disabled={loading}
              >
                {loading ? t('processing') : t('createAccount')}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

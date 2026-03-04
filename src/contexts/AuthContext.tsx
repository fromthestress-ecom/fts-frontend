"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { fetchApi } from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  referralCode: string;
  affiliateId?: {
    _id: string;
    status: string;
    commissionRate: number;
    walletBalance: number;
    pendingBalance: number;
    totalEarned: number;
  } | null;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAffiliate: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    referredByCode?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ──────────────────────────────────────────────────────────────── */

const TOKEN_KEY = "fts_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAffiliate =
    !!user?.affiliateId && user.affiliateId.status === "active";

  /* Restore session on mount */
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      fetchMe(saved).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMe(tkn: string) {
    try {
      const data = await fetchApi<AuthUser>("/auth/me", {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      setUser(data);
    } catch {
      // Token invalid → clear
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }

  const refreshUser = useCallback(async () => {
    if (token) await fetchMe(token);
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetchApi<{ accessToken: string; user: AuthUser }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    setToken(res.accessToken);
    // Fetch full user profile
    await fetchMe(res.accessToken);
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      referredByCode?: string;
    }) => {
      const res = await fetchApi<{ accessToken: string; user: AuthUser }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      setToken(res.accessToken);
      await fetchMe(res.accessToken);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAffiliate,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────────────────────────── */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

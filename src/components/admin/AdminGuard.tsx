"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const ADMIN_KEY = "streetwear_admin_key";
const ADMIN_PROFILE = "streetwear_admin_profile";
const LOCALE_PREFIX_RE = /^\/(vi|en)(?=\/|$)/;

export type AdminProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  authMode: "user" | "api-key";
};

type NavRule = {
  prefix: string;
  permission?: string;
};

const navRules: NavRule[] = [
  { prefix: "/admin/login" },
  { prefix: "/admin", permission: "reports:view" },
  { prefix: "/admin/orders", permission: "orders:manage" },
  { prefix: "/admin/users", permission: "users:manage" },
  { prefix: "/admin/categories", permission: "catalog:manage" },
  { prefix: "/admin/products", permission: "catalog:manage" },
  { prefix: "/admin/templates", permission: "catalog:manage" },
  { prefix: "/admin/events", permission: "catalog:manage" },
  { prefix: "/admin/blogs", permission: "content:write" },
  { prefix: "/admin/blog-categories", permission: "content:write" },
  { prefix: "/admin/authors", permission: "content:write" },
  { prefix: "/admin/tags", permission: "content:write" },
  { prefix: "/admin/media", permission: "content:write" },
  { prefix: "/admin/blog-crawl", permission: "ai:use" },
  { prefix: "/admin/ai-writer", permission: "ai:use" },
  { prefix: "/admin/affiliates", permission: "affiliates:manage" },
  { prefix: "/admin/referrals", permission: "referrals:manage" },
];

export function normalizeAdminPath(pathname: string | null | undefined) {
  const rawPath = pathname || "/admin";
  const withoutLocale = rawPath.replace(LOCALE_PREFIX_RE, "") || "/";
  return withoutLocale === "/" ? "/admin" : withoutLocale;
}

export function getAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_KEY);
}

export function setAdminKey(key: string | null) {
  if (typeof window === "undefined") return;
  if (key) {
    sessionStorage.setItem(ADMIN_KEY, key);
  } else {
    sessionStorage.removeItem(ADMIN_KEY);
  }
}

export function getAdminProfile(): AdminProfile | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ADMIN_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    sessionStorage.removeItem(ADMIN_PROFILE);
    return null;
  }
}

export function setAdminProfile(profile: AdminProfile | null) {
  if (typeof window === "undefined") return;
  if (profile) {
    sessionStorage.setItem(ADMIN_PROFILE, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(ADMIN_PROFILE);
  }
}

export function clearAdminSession() {
  setAdminKey(null);
  setAdminProfile(null);
}

export function hasAdminPermission(
  profile: AdminProfile | null | undefined,
  permission: string,
) {
  if (!profile) return false;
  return (
    profile.permissions.includes("*") || profile.permissions.includes(permission)
  );
}

export function canAccessAdminPath(
  profile: AdminProfile | null | undefined,
  pathname: string | null | undefined,
) {
  const normalizedPath = normalizeAdminPath(pathname);
  const rule = [...navRules]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find(
      (item) =>
        normalizedPath === item.prefix ||
        normalizedPath.startsWith(`${item.prefix}/`),
    );

  if (!rule?.permission) {
    return true;
  }

  return hasAdminPermission(profile, rule.permission);
}

export function getDefaultAdminPath(profile: AdminProfile | null | undefined) {
  if (hasAdminPermission(profile, "reports:view")) return "/admin";
  if (hasAdminPermission(profile, "content:write")) return "/admin/blogs";
  if (hasAdminPermission(profile, "catalog:manage")) return "/admin/products";
  if (hasAdminPermission(profile, "orders:manage")) return "/admin/orders";
  if (hasAdminPermission(profile, "users:manage")) return "/admin/users";
  if (hasAdminPermission(profile, "affiliates:manage")) return "/admin/affiliates";
  return "/admin/login";
}

export async function loadAdminProfile(credential?: string | null) {
  const adminKey = credential ?? getAdminKey();
  if (!adminKey) return null;

  const res = await fetch(`${API}/admin/auth/me`, {
    headers: { "x-admin-key": adminKey },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  const profile = (await res.json()) as AdminProfile;
  setAdminProfile(profile);
  return profile;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let active = true;
    const normalizedPath = normalizeAdminPath(pathname);

    if (normalizedPath === "/admin/login") {
      setOk(true);
      return () => {
        active = false;
      };
    }

    const credential = getAdminKey();
    if (!credential) {
      clearAdminSession();
      router.replace("/admin/login");
      return () => {
        active = false;
      };
    }

    setOk(false);
    loadAdminProfile(credential)
      .then((profile) => {
        if (!active) return;
        if (!profile) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        if (!canAccessAdminPath(profile, normalizedPath)) {
          router.replace(getDefaultAdminPath(profile));
          return;
        }

        setOk(true);
      })
      .catch(() => {
        if (!active) return;
        clearAdminSession();
        router.replace("/admin/login");
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ok) return null;
  return <>{children}</>;
}

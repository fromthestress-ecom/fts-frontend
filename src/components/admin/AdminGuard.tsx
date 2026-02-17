'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ADMIN_KEY = 'streetwear_admin_key';

export function getAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_KEY);
}

export function setAdminKey(key: string | null) {
  if (typeof window === 'undefined') return;
  if (key) sessionStorage.setItem(ADMIN_KEY, key);
  else sessionStorage.removeItem(ADMIN_KEY);
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setOk(true);
      return;
    }
    const key = getAdminKey();
    if (!key) {
      router.replace('/admin/login');
      return;
    }
    setOk(true);
  }, [pathname, router]);

  if (!ok) return null;
  return <>{children}</>;
}

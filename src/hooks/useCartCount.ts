'use client';

import { useSyncExternalStore } from 'react';

function getSnapshot() {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('streetwear-cart-count');
    return raw ? Number.parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useCartCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

export function setCartCount(count: number) {
  localStorage.setItem('streetwear-cart-count', String(count));
  window.dispatchEvent(new Event('storage'));
}

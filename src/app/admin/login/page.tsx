'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminKey } from '@/components/admin/AdminGuard';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/auth/verify`, {
        method: 'POST',
        headers: { 'x-admin-key': key },
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        setAdminKey(key);
        router.replace('/admin');
        return;
      }
      setError(data.message ?? 'Sai API Key');
    } catch {
      setError('Không kết nối được server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
        Admin đăng nhập
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Nhập Admin API Key (cấu hình trong backend .env: ADMIN_API_KEY)
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin API Key"
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
          }}
        />
        {error && (
          <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--accent)',
            color: 'var(--bg)',
            fontWeight: 700,
            border: 'none',
            borderRadius: 8,
          }}
        >
          {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getAdminKey } from '@/components/admin/AdminGuard';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Category = { _id: string; slug: string; name: string; description?: string; order: number };

function adminFetch(path: string, init?: RequestInit) {
  const key = getAdminKey();
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': key ?? '',
      ...init?.headers,
    },
  });
}

export default function AdminCategoriesPage() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminFetch('/admin/categories');
    if (res.ok) setList(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    const res = await adminFetch('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ slug: slug.trim(), name: name.trim(), order }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? 'Đã thêm.' : (data.message ?? 'Lỗi'));
    setSaving(false);
    if (res.ok) {
      setSlug('');
      setName('');
      setOrder(0);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa danh mục này?')) return;
    await adminFetch(`/admin/categories/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem' }}>
        Danh mục
      </h1>
      <form
        onSubmit={handleAdd}
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ao-hoodie"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
            Tên
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Áo Hoodie"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
            Thứ tự
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 0)}
            style={{ ...inputStyle, width: 80 }}
          />
        </div>
        <button type="submit" disabled={saving} style={btnPrimary}>
          {saving ? 'Đang thêm...' : 'Thêm danh mục'}
        </button>
        {message && <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{message}</span>}
      </form>
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Đang tải...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Slug</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tên</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Thứ tự</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{c.slug}</td>
                <td style={{ padding: '0.5rem' }}>{c.name}</td>
                <td style={{ padding: '0.5rem' }}>{c.order}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => handleDelete(c._id)}
                    style={{ ...btnPrimary, background: '#dc2626', color: '#fff' }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text)',
};
const btnPrimary: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: 'var(--accent)',
  color: 'var(--bg)',
  fontWeight: 600,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

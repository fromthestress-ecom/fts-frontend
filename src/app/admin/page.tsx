import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Chọn chức năng bên trái để quản lý nội dung.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href="/admin/categories"
          style={{
            display: 'block',
            padding: '1rem 1.5rem',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            minWidth: 160,
          }}
        >
          <strong>Danh mục</strong>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Thêm, sửa, xóa danh mục
          </p>
        </Link>
        <Link
          href="/admin/products"
          style={{
            display: 'block',
            padding: '1rem 1.5rem',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            minWidth: 160,
          }}
        >
          <strong>Sản phẩm</strong>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Thêm, sửa, xóa sản phẩm
          </p>
        </Link>
      </div>
    </>
  );
}

import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/san-pham',
        has: [{ type: 'query', key: 'danh_muc', value: '(?<cat>.+)' }],
        destination: '/san-pham/:cat',
        permanent: true,
      },
      {
        source: '/en/san-pham',
        has: [{ type: 'query', key: 'danh_muc', value: '(?<cat>.+)' }],
        destination: '/en/san-pham/:cat',
        permanent: true,
      },
      {
        source: '/best-selling',
        has: [{ type: 'query', key: 'danh_muc', value: '(?<cat>.+)' }],
        destination: '/best-selling/:cat',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

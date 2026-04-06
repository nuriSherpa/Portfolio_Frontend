/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'tendinurisherpa.com.np',
    'www.tendinurisherpa.com.np',
    'localhost',
    '127.0.0.1',
    '*.tendinurisherpa.com.np',
  ],

  devIndicators: { buildActivity: false },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '80', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'tendinurisherpa.com.np', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**', pathname: '/uploads/**' },
    ],
  },

  compress: true,
  trailingSlash: false,
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_IS_TUNNEL: process.env.USE_TUNNEL === 'true' ? 'true' : 'false',
  },

  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:9090/api/v1';
    const adminApiUrl = process.env.ADMIN_API_URL || 'http://localhost:9090/api/v1/admin';
    const cdnUrl = process.env.CDN_URL || 'http://localhost:80';

    return [
      // Public API proxy
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },

      // REMOVE the /api/admin/:path* rewrite entirely.
      // src/app/api/admin/[...path]/route.ts handles all /api/admin/* requests
      // and adds the Authorization header. The rewrite was bypassing it.

      // Legacy paths
      {
        source: '/api/v1/admin/:path*',
        destination: `${adminApiUrl}/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/:path*`,
      },

      // CDN uploads
      {
        source: '/uploads/:path*',
        destination: `${cdnUrl}/uploads/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

module.exports = nextConfig;

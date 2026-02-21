/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9090',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9090',
        pathname: '/uploads/**',
      },
    ],
    minimumCacheTTL: 60, // Cache images for 60 seconds
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow local images during development
    unoptimized: process.env.NODE_ENV === 'development',
  },

  compress: true,
  trailingSlash: true,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:9090/api/v1/:path*',
      },
      // NEW: Proxy uploads to Nginx
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:80/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

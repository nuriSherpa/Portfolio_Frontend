/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false, // Disable the black square
    buildActivityPosition: 'bottom-right', // Or move it
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9090',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'media.canva.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.canva.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
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
    ];
  },
};

module.exports = nextConfig;

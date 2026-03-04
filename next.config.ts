/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  images: {
    // Empty - we use rewrites, no external hosts needed
  },

  compress: true,
  trailingSlash: true,
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
      // Proxy uploads through Next.js (same origin, no private IP blocking)
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:80/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/contribute',
        destination: '/get-involved',
        permanent: true,
      },
      {
        source: '/stats#data',
        destination: '/data',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              isProd
                ? "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://cloudflareinsights.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://cdn.jsdelivr.net",
              "font-src 'self'",
              "connect-src 'self' https://cloudflareinsights.com",
              isProd
                ? "frame-src 'self'"
                : "frame-src 'self' https://cloud.umami.is https://eu.umami.is",
              "object-src 'none'",
              "base-uri 'none'",
              "frame-ancestors 'self'",
            ].join('; ') + ';',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        // Cache all static assets for one year
        source: '/_next/static/(.*)',
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
        source: '/umami/script.js',
        destination: 'https://cloud.umami.is/script.js',
      },
      {
        source: '/umami/api/send',
        destination: 'https://cloud.umami.is/api/send',
      },
    ];
  },
  transpilePackages: ["framer-motion"],
  // swcMinify has been removed in Next.js 15
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    // Trusted Types policy for Next bundler
    config.output.trustedTypes = { policyName: 'nextjs#bundler' };
    return config;
  },
  reactStrictMode: true,
};

export default nextConfig;

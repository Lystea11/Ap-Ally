import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // SEO: never serve trailing-slash URLs
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [
      // www → non-www canonical redirect
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.ap-ally.com',
          },
        ],
        destination: 'https://ap-ally.com/:path*',
        permanent: true,
      },
      // Explicit trailing-slash redirects for routes where trailingSlash:false
      // has been observed to return unexpected statuses in crawls.
      {
        source: '/onboarding/',
        destination: '/onboarding',
        permanent: true,
      },
      {
        source: '/cookie-policy/',
        destination: '/cookie-policy',
        permanent: true,
      },
      {
        source: '/dashboard/',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/practice-quiz/',
        destination: '/practice-quiz',
        permanent: true,
      },
      {
        source: '/privacy-settings/',
        destination: '/privacy-settings',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

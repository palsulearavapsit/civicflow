import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removing output: 'export' to support Server Actions and Middleware
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com; style-src 'self' 'unsafe-inline' *.googleapis.com; img-src 'self' data: *.google.com *.googleapis.com *.gstatic.com *.flaticon.com; connect-src 'self' *.google.com *.googleapis.com *.firebaseio.com; font-src 'self' *.gstatic.com; frame-src *.google.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

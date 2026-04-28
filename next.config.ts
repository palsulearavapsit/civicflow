import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  // EFF-01: Partial Prerendering (PPR) for Dashboard
  experimental: {
    ppr: 'incremental',
    optimizePackageImports: ['lucide-react', 'framer-motion', '@google/generative-ai'],
  },

  // EFF-06: Image optimization with AVIF
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.google.com' },
      { protocol: 'https', hostname: '*.googleapis.com' },
      { protocol: 'https', hostname: '*.gstatic.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  async headers() {
    return [
      {
        // EFF-17: Browser caching for all static assets
        source: '/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        // Security headers for all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // SEC-09: Permissions-Policy (camera, microphone)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com; report-uri /api/csp-report" },
          // EFF-04: Streaming metadata header
          { key: 'X-Metadata-Streaming', value: 'enabled' },
        ],
      },
    ];
  },

  // EFF-18: Cold start optimization — reduce serverless function size
  serverExternalPackages: ['firebase-admin'],

  // EFF-08: Webpack code splitting configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            // Separate chunk for Map libraries (heavy)
            maps: {
              test: /[\\/]node_modules[\\/](mapbox-gl|react-map-gl|leaflet|react-leaflet)[\\/]/,
              name: 'maps',
              chunks: 'all',
              priority: 20,
            },
            // Separate chunk for AI library
            ai: {
              test: /[\\/]node_modules[\\/](@google\/generative-ai)[\\/]/,
              name: 'ai',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;

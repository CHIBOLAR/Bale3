import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance Optimizations
  // Note: SWC minification is now enabled by default in Next.js 15+

  // Compression (gzip)
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for 60 seconds
  },

  // Output optimization
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode for better error detection

  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'mcb761qn-3000.inc1.devtunnels.ms']
    },
  },

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      // Remove console.logs in production
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

export default nextConfig;

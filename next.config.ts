import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'mcb761qn-3000.inc1.devtunnels.ms']
    }
  }
};

export default nextConfig;

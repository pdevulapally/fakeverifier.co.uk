import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' }
  },
  turbopack: {
    root: __dirname, // ensure correct workspace root for module resolution
  },
};

export default nextConfig;



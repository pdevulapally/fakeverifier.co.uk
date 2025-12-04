import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' }
  },
  // Turbopack config (Next.js 16+ uses Turbopack by default)
  // Set root to current directory to avoid lockfile detection issues
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic ZIP files from bundling
    config.module.rules.push({
      test: /\.zip$/,
      use: 'ignore-loader'
    });
    
    // Exclude specific problematic files
    config.module.rules.push({
      test: /Iterator\.zip$/,
      use: 'ignore-loader'
    });
    
    return config;
  },
};

export default nextConfig;



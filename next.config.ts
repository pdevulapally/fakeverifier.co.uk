import type { NextConfig } from 'next';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' }
  },
  turbopack: {
    root: __dirname, // ensure correct workspace root for module resolution
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



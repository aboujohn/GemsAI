import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    domains: ['localhost', process.env.AWS_CLOUDFRONT_DOMAIN?.replace(/https?:\/\//, '') || ''],
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },
  // Webpack optimization for development to prevent memory allocation errors
  webpack: (config, { dev }) => {
    if (dev) {
      // Reduce memory usage in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      // Disable cache in development to prevent memory issues
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;

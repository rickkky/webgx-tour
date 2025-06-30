import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader'],
      },
    },
  },
};

export default nextConfig;

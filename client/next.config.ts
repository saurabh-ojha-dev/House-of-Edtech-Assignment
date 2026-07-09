import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['yjs', 'y-websocket', '@tiptap/extension-collaboration'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      yjs: require.resolve('yjs'),
    };
    return config;
  },
};

export default nextConfig;

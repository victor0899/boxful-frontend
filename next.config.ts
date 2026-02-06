import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.ignoreWarnings = [
      {
        module: /node_modules\/antd/,
        message: /antd v5 support React/,
      },
    ];
    return config;
  },
};

export default nextConfig;

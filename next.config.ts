import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // 開発時のスマホ実機確認用（各メンバーのローカルIP）
  allowedDevOrigins: [
    '172.24.44.126',
    '172.24.44.126:3000',
    '10.0.0.15',
    '10.0.0.15:3000',
    'localhost:3000',
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

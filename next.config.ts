import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Allow local network devices (smartphones) to connect in development
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

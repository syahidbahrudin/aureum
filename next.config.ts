import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // postgres.js array parsers break when Turbopack bundles the driver.
  serverExternalPackages: ["postgres", "sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
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

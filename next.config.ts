import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["v0.blob.vercel-storage.com"],
    unoptimized: true,
  },
};

export default nextConfig;

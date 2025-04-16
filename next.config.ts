import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://uwezb69ykmyxa3dv.public.blob.vercel-storage.com/**"),
    ],
  },
  reactStrictMode: true,
  experimental: {
    viewTransition: true,
    ppr: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The original Vite app keeps reusable view components under src/pages.
  // Restrict the legacy Pages Router so Next.js does not interpret those
  // components as file-system routes. The App Router in src/app remains active.
  pageExtensions: ["next.tsx", "next.ts", "next.jsx", "next.js"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

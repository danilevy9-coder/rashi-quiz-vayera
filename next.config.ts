import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Capacitor native builds
  // To build for native: NEXT_PUBLIC_STATIC_EXPORT=1 next build
  ...(process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" ? { output: "export" } : {}),
};

export default nextConfig;

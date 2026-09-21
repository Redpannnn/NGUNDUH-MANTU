import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // z.ai deploy butuh output:"standalone" (Caddy reverse-proxy ke port 3000
  // via .next/standalone/server.js). Vercel juga kompatibel dengan ini.
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai", "*.z.ai"],
};

export default nextConfig;

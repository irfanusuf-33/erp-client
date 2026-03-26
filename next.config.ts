import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://erpapi.voctrum.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
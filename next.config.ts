import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Cache all speaker images for 1 year (immutable static assets)
        source: "/speakers/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=172800, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

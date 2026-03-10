import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Enable SharedArrayBuffer for all routes
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
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

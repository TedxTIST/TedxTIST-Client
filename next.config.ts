/**
 * Security headers for CSP and HSTS
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; child-src 'self' blob:; connect-src *;"
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
];

/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
        key: 'Content-Security-Policy',
            // Notice the addition of https://cdnjs.cloudflare.com to style-src and font-src
            value: "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com data:; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
      },
    ];
  },
};

module.exports = nextConfig;

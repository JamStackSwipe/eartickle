/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['blob.vercel-storage.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'], // Neon in server components
  },
  generateEtags: false, // No cache on static for fresh deploys
  swcMinify: true, // Faster builds
};

module.exports = nextConfig;

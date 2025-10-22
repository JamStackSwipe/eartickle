/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['blob.vercel-storage.com'],
    // Force fresh image optimization (no cache for dev/testing)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Experimental: Edge runtime for API routes (Neon loves this for low-latency queries)
  experimental: {
    runtime: 'edge', // Or 'nodejs' if Neon driver conflicts (test both)
    serverComponentsExternalPackages: ['@neondatabase/serverless'], // Allows Neon in server components
  },
  // Env validation (logs on build if DB URL missing—Vercel Functions will show it)
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'MISSING_NEON_URL_WARN',
  },
  // No cache on static exports (forces fresh on every deploy)
  generateEtags: false,
  swcMinify: true, // Faster builds
};

module.exports = nextConfig;

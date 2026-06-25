/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["bullmq", "ioredis"],
    instrumentationHook: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  webpack: (config, { isServer, nextRuntime }) => {
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "./instrumentation-node": path.resolve(__dirname, "src/instrumentation-node.stub.ts"),
      }
    }
    if (isServer) {
      config.externals = [...(config.externals || []), "ioredis", "bullmq"]
    }
    return config
  },

  // Phase 10: Network Optimization — Granular Cache-Control headers
  async headers() {
    return [
      // Next.js static chunks: fully immutable (content-hashed filenames)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Public directory: images, fonts, videos — long-lived with revalidation
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2|ttf|mp4|mov)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // API routes: never cache (always fresh data)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      // Performance and security headers on all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)

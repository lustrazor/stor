/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,  // Disable image optimization for uploaded files
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure uploads are served as static files
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/public/uploads/:path*',
      },
    ];
  },
  // Configure static file serving
  assetPrefix: '',
  basePath: '',
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
}

module.exports = nextConfig
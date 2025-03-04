/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,  // Disable image optimization for uploaded files
    domains: ['localhost'], // Allow serving from localhost
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
}

module.exports = nextConfig
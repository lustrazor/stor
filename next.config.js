/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,  // Disable image optimization for uploaded files
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure static file serving
  assetPrefix: '',
  basePath: '',
  // Ensure public directory is included in the build
  outputFileTracingIncludes: {
    '/**': ['./public/**/*']
  },
  // Add custom headers for static files
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
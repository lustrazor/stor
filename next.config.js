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
  // Serve static files from the public directory
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./public/**/*']
    }
  }
}

module.exports = nextConfig
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
  outputFileTracingIncludes: {
    '/**': ['./public/**/*']
  }
}

module.exports = nextConfig
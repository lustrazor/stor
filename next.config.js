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
  // Configure static file serving middleware
  webpack: (config, { isServer }) => {
    // Add rule for handling static files
    config.module.rules.push({
      test: /\.(jpg|jpeg|png|gif|ico|svg)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/images',
            outputPath: 'static/images',
          },
        },
      ],
    });
    return config;
  },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // For GitHub Pages, set basePath if deploying to a subdirectory
  // basePath: '/Malicious-URL-Scanner',
  // trailingSlash: true,
}

module.exports = nextConfig


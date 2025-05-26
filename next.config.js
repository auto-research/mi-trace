/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/mi-trace',
  assetPrefix: '/mi-trace/',
  images: { unoptimized: true },
}

module.exports = nextConfig

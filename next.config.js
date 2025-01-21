/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js', 'zerox', 'sharp']
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom']
    return config
  }
}

module.exports = nextConfig 
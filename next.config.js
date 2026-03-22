/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  // Static export for GitHub Pages preview deployments
  ...(isGitHubPages && {
    output: 'export',
    basePath: '/godnt',
    assetPrefix: '/godnt/',
    images: { unoptimized: true },
  }),
  webpack: (config) => {
    // Suppress warnings from MetaMask SDK (React Native deps) and pino-pretty
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
      encoding: false,
    }
    return config
  },
}

module.exports = nextConfig

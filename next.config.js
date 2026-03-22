/** @type {import('next').NextConfig} */
const nextConfig = {
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

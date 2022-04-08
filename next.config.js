/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')
module.exports = {
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[path][name].[hash][ext]',
      },
    })
    return config
  },
  reactStrictMode: true,
  images: { domains: ['lostarkcodex.com'] },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/alarms',
        permanent: true,
      },
    ]
  },
  i18n,
}

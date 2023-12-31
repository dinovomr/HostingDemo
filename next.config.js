const jssConfig = require('./src/temp/config');
const { getPublicUrl } = require('@sitecore-jss/sitecore-jss-nextjs/utils');
const plugins = require('./src/temp/next-config-plugins') || {};

const publicUrl = getPublicUrl();

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Set assetPrefix to our public URL
  assetPrefix: publicUrl,

  //Disable Image Optimization
  images: {
    unoptimized: true,
  },

  output: "standalone",

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Allow specifying a distinct distDir when concurrently running app in a container
  //distDir: process.env.NEXTJS_DIST_DIR || '.next',

  // Make the same PUBLIC_URL available as an environment variable on the client bundle
  env: {
    PUBLIC_URL: publicUrl,
  },

  // i18n: {
  //   // These are all the locales you want to support in your application.
  //   // These should generally match (or at least be a subset of) those in Sitecore.
  //   // DEMO TEAM CUSTOMIZATION - Remove unused languages and add some
  //   locales: [
  //     'en',
  //     'fr-CA',
  //     'ja-JP',
  //   ],
  //   // END CUSTOMIZATION
  //   // This is the locale that will be used when visiting a non-locale
  //   // prefixed path e.g. `/styleguide`.
  //   defaultLocale: jssConfig.defaultLanguage,
  //   localeDetection: false, // DEMO TEAM CUSTOMIZATION - Disable locale detection
  // },

  i18n: !process.env.EXPORT_MODE && {
    // These are all the locales you want to support in your application.
    // These should generally match (or at least be a subset of) those in Sitecore.
    locales: ['en', 'fr-CA', 'ja-JP'],
    // This is the locale that will be used when visiting a non-locale
    // prefixed path e.g. `/styleguide`.
    defaultLocale: jssConfig.defaultLanguage,
    localeDetection: false, // DEMO TEAM CUSTOMIZATION - Disable locale detection
  },
  rewrites: !process.env.EXPORT_MODE && (async () => {
    if (isDisconnected) {
      // When disconnected we proxy to the local faux layout service host, see scripts/disconnected-mode-server.js
      return [
        // rewrite rules
      ];
    }
  }),

  // Enable React Strict Mode
  reactStrictMode: true,

  async rewrites() {
    // When in connected mode we want to proxy Sitecore paths off to Sitecore
    return [
      // API endpoints
      {
        source: '/sitecore/api/:path*',
        destination: `${jssConfig.sitecoreApiHost}/sitecore/api/:path*`,
      },
      // media items
      {
        source: '/-/:path*',
        destination: `${jssConfig.sitecoreApiHost}/-/:path*`,
      },
      // healthz check
      {
        source: '/healthz',
        destination: '/api/healthz',
      },
      // rewrite for Sitecore service pages
      {
        source: '/sitecore/service/:path*',
        destination: `${jssConfig.sitecoreApiHost}/sitecore/service/:path*`,
      },
    ];
  },
};

module.exports = () => {
  // Run the base config through any configured plugins
  return Object.values(plugins).reduce((acc, plugin) => plugin(acc), nextConfig);
}

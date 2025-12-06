// const nextConfig = {
//   trailingSlash: false,

//   webpack(config) {
//     config.module.rules.push({
//       test: /\.svg$/,
//       use: ['@svgr/webpack'],
//     });
//     return config;
//   },

//   sassOptions: {
//     additionalData: `
//       @use "src/shared/styles/_breakpoints.scss" as *;
//       @use "src/shared/styles/_mixins.scss" as *;
//       @use "src/shared/styles/_variables.scss" as *;
//     `,
//   },

//   images: {
//     remotePatterns: [
//       { protocol: 'https', hostname: 'cdn.sanity.io' },
//       { protocol: 'https', hostname: 'res.cloudinary.com' },
//     ],
//   },
// };

// export default nextConfig;
const nextConfig = {
  trailingSlash: false,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://app-server-o38y.onrender.com/:path*',
      },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  sassOptions: {
    additionalData: `
      @use "src/shared/styles/_breakpoints.scss" as *;
      @use "src/shared/styles/_mixins.scss" as *;
      @use "src/shared/styles/_variables.scss" as *;
    `,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;

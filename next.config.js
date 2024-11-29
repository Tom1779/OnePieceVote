module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
        pathname: "**",
      },
    ],
    domains: ["https://www.onepiecevoting.com/"],
  },
};

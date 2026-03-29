/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.worldlabs.ai",
      },
    ],
  },
};

export default nextConfig;

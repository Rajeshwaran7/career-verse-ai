/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'github.com',
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;

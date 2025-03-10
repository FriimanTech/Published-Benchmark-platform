/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'export' output for server-side rendering
  // output: 'export',
  
  // Enable React strict mode for better development
  reactStrictMode: true,
  
  // Configure image domains if needed
  images: {
    domains: ['localhost'],
  },
  
  // Allow Railway to handle the port
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;

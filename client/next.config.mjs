/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    VITE_API_URL: process.env.VITE_API_URL,
    VITE_SOCKET_URL: process.env.VITE_SOCKET_URL,
  },
}

export default nextConfig

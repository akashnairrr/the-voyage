import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static site for GitHub Pages. The Pages workflow sets the base path (/the-voyage).
  output: 'export',
  basePath: process.env.PAGES_BASE_PATH || undefined,
};

export default nextConfig;

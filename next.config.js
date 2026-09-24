/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Replace 'your-repo-name' with your actual GitHub repo name.
// If you deploy to a custom domain instead of username.github.io/repo-name,
// remove basePath and assetPrefix entirely.
const repoName = 'your-repo-name';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // required for static export; GitHub Pages can't run Next's image optimizer
  },
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  trailingSlash: true,
};

module.exports = nextConfig;

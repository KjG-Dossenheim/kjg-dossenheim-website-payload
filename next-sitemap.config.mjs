/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateIndexSitemap: false, // (optional)
  generateRobotsTxt: true, // (optional)
  exclude: ['/blog-sitemap.xml'], // <= exclude here
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/blog-sitemap.xml`, // <==== Add here
    ],
  },
};

export default config;
/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL,
  generateIndexSitemap: false, // (optional)
  generateRobotsTxt: true, // (optional)
  exclude: ['/blog-sitemap.xml'], // <= exclude here
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.SITE_URL}/blog-sitemap.xml`, // <==== Add here
    ],
  },
};

export default config;